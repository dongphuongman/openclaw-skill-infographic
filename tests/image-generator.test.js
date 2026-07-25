const { describe, it, before, after, beforeEach, afterEach, mock } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');

const { s3Hash, s3Hmac, uploadToR2, uploadToImgBB, generateImage, generateHtml } = require('../image-generator.js');

const TINY_PNG = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
);

function tmpFile() {
    const p = path.join(os.tmpdir(), `test-${Date.now()}-${Math.random().toString(36).slice(2)}.png`);
    fs.writeFileSync(p, TINY_PNG);
    return p;
}

// --- Crypto helpers ---

describe('s3Hash', () => {
    it('returns correct SHA-256 hex', () => {
        assert.equal(
            s3Hash('hello'),
            '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824'
        );
    });

    it('handles Buffer input', () => {
        const hash = s3Hash(Buffer.from([0x00, 0xff]));
        assert.equal(typeof hash, 'string');
        assert.equal(hash.length, 64);
    });
});

describe('s3Hmac', () => {
    it('returns 32-byte Buffer', () => {
        const result = s3Hmac('secret', 'data');
        assert.ok(Buffer.isBuffer(result));
        assert.equal(result.length, 32);
    });
});

// --- File name sanitization ---

describe('uploadToR2 file name sanitization', () => {
    let testFile;
    const savedEnv = {};

    before(() => {
        testFile = tmpFile();
        for (const k of ['R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_ACCOUNT_ID', 'R2_BUCKET', 'R2_PUBLIC_URL']) {
            savedEnv[k] = process.env[k];
        }
        process.env.R2_ACCESS_KEY_ID = 'test-key';
        process.env.R2_SECRET_ACCESS_KEY = 'test-secret';
        process.env.R2_ACCOUNT_ID = 'test-account';
        process.env.R2_BUCKET = 'test-bucket';
        process.env.R2_PUBLIC_URL = 'https://img.example.com';
    });

    after(() => {
        if (fs.existsSync(testFile)) fs.unlinkSync(testFile);
        for (const [k, v] of Object.entries(savedEnv)) {
            if (v === undefined) delete process.env[k];
            else process.env[k] = v;
        }
    });

    it('replaces Vietnamese and special chars with underscores', async () => {
        let capturedUrl = '';
        const origFetch = globalThis.fetch;
        globalThis.fetch = async (url) => {
            capturedUrl = url;
            return { ok: true, text: async () => '' };
        };

        try {
            const result = await uploadToR2(testFile, 'ảnh bìa (2).png');
            assert.ok(!capturedUrl.includes('ả'));
            assert.ok(!capturedUrl.includes(' '));
            assert.ok(!capturedUrl.includes('('));
            assert.match(result, /^https:\/\/img\.example\.com\/infographic\/\d+-_nh_b_a__2_.png$/);
        } finally {
            globalThis.fetch = origFetch;
        }
    });

    it('keeps safe ASCII chars unchanged', async () => {
        const origFetch = globalThis.fetch;
        globalThis.fetch = async () => ({ ok: true, text: async () => '' });

        try {
            const result = await uploadToR2(testFile, 'my-image_01.png');
            assert.match(result, /my-image_01\.png$/);
        } finally {
            globalThis.fetch = origFetch;
        }
    });
});

// --- Upload disabled ---

describe('upload disabled', () => {
    const savedProvider = process.env.IMAGE_UPLOAD_PROVIDER;

    before(() => { delete process.env.IMAGE_UPLOAD_PROVIDER; });
    after(() => {
        if (savedProvider === undefined) delete process.env.IMAGE_UPLOAD_PROVIDER;
        else process.env.IMAGE_UPLOAD_PROVIDER = savedProvider;
    });

    it('generateImage succeeds without calling any upload', async () => {
        const testOutput = tmpFile();
        const fakeB64 = TINY_PNG.toString('base64');
        const origFetch = globalThis.fetch;
        let uploadCalled = false;

        globalThis.fetch = async (url) => {
            if (url.includes('r2.cloudflarestorage') || url.includes('imgbb')) {
                uploadCalled = true;
            }
            return {
                ok: true,
                json: async () => ({
                    data: [{ b64_json: fakeB64 }]
                }),
                text: async () => '',
            };
        };

        try {
            const result = await generateImage('test prompt', testOutput);
            assert.ok(fs.existsSync(result));
            assert.equal(uploadCalled, false);
        } finally {
            globalThis.fetch = origFetch;
            if (fs.existsSync(testOutput)) fs.unlinkSync(testOutput);
        }
    });
});

// --- Upload failure graceful degradation ---

describe('upload failure graceful degradation', () => {
    it('R2 upload failure does not crash generateImage', async () => {
        const testOutput = tmpFile();
        const fakeB64 = TINY_PNG.toString('base64');
        const origFetch = globalThis.fetch;
        const savedEnv = {};

        for (const k of ['IMAGE_UPLOAD_PROVIDER', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_ACCOUNT_ID', 'R2_BUCKET', 'R2_PUBLIC_URL']) {
            savedEnv[k] = process.env[k];
        }
        process.env.IMAGE_UPLOAD_PROVIDER = 'r2';
        process.env.R2_ACCESS_KEY_ID = 'k';
        process.env.R2_SECRET_ACCESS_KEY = 's';
        process.env.R2_ACCOUNT_ID = 'a';
        process.env.R2_BUCKET = 'b';
        process.env.R2_PUBLIC_URL = 'https://x.com';

        let callCount = 0;
        globalThis.fetch = async (url) => {
            callCount++;
            if (url.includes('r2.cloudflarestorage')) {
                return { ok: false, text: async () => 'Forbidden' };
            }
            return {
                ok: true,
                json: async () => ({ data: [{ b64_json: fakeB64 }] }),
                text: async () => '',
            };
        };

        try {
            const result = await generateImage('test prompt', testOutput);
            assert.ok(fs.existsSync(result), 'local file must still exist');
        } finally {
            globalThis.fetch = origFetch;
            for (const [k, v] of Object.entries(savedEnv)) {
                if (v === undefined) delete process.env[k];
                else process.env[k] = v;
            }
            if (fs.existsSync(testOutput)) fs.unlinkSync(testOutput);
        }
    });

    it('ImgBB upload failure does not crash generateImage', async () => {
        const testOutput = tmpFile();
        const fakeB64 = TINY_PNG.toString('base64');
        const origFetch = globalThis.fetch;
        const savedEnv = {};

        for (const k of ['IMAGE_UPLOAD_PROVIDER', 'IMGBB_API_KEY']) {
            savedEnv[k] = process.env[k];
        }
        process.env.IMAGE_UPLOAD_PROVIDER = 'imgbb';
        process.env.IMGBB_API_KEY = 'fake-key';

        globalThis.fetch = async (url) => {
            if (url.includes('imgbb')) {
                return {
                    ok: true,
                    json: async () => ({ success: false, status_code: 500, error: { message: 'server error' } }),
                };
            }
            return {
                ok: true,
                json: async () => ({ data: [{ b64_json: fakeB64 }] }),
                text: async () => '',
            };
        };

        try {
            const result = await generateImage('test prompt', testOutput);
            assert.ok(fs.existsSync(result), 'local file must still exist');
        } finally {
            globalThis.fetch = origFetch;
            for (const [k, v] of Object.entries(savedEnv)) {
                if (v === undefined) delete process.env[k];
                else process.env[k] = v;
            }
            if (fs.existsSync(testOutput)) fs.unlinkSync(testOutput);
        }
    });
});

// --- R2 missing config ---

describe('uploadToR2 missing config', () => {
    it('throws when R2 env vars are missing', async () => {
        const saved = process.env.R2_ACCESS_KEY_ID;
        delete process.env.R2_ACCESS_KEY_ID;
        try {
            await assert.rejects(() => uploadToR2('/tmp/x.png', 'x.png'), /Missing R2 config/);
        } finally {
            if (saved !== undefined) process.env.R2_ACCESS_KEY_ID = saved;
        }
    });
});

// --- ImgBB missing config ---

describe('uploadToImgBB missing config', () => {
    it('throws when IMGBB_API_KEY is missing', async () => {
        const saved = process.env.IMGBB_API_KEY;
        delete process.env.IMGBB_API_KEY;
        try {
            await assert.rejects(() => uploadToImgBB('/tmp/x.png'), /Missing IMGBB_API_KEY/);
        } finally {
            if (saved !== undefined) process.env.IMGBB_API_KEY = saved;
        }
    });
});

// --- Generation success with mocked API ---

// --- HTML template generation ---

describe('generateHtml', () => {
    it('food-guide template returns valid HTML', () => {
        const html = generateHtml({
            template: 'food-guide',
            title: 'Test Title',
            items: [{ name: 'Phở', emoji: '🍜', price: '50k', description: 'Noodle soup' }],
        });
        assert.ok(html.includes('<!DOCTYPE html>'));
        assert.ok(html.includes('Test Title'));
        assert.ok(html.includes('Noodle soup'));
    });

    it('list-cards template returns valid HTML', () => {
        const html = generateHtml({
            template: 'list-cards',
            title: 'Top Items',
            items: [{ name: 'Item 1', emoji: '✅' }, { name: 'Item 2' }],
        });
        assert.ok(html.includes('<!DOCTYPE html>'));
        assert.ok(html.includes('Top Items'));
        assert.ok(html.includes('Item 1'));
        assert.ok(html.includes('Item 2'));
    });

    it('grid template returns valid HTML', () => {
        const html = generateHtml({
            template: 'grid',
            title: 'Grid Test',
            columns: 2,
            items: [{ name: 'A', emoji: '🔥' }, { name: 'B' }, { name: 'C' }],
        });
        assert.ok(html.includes('<!DOCTYPE html>'));
        assert.ok(html.includes('Grid Test'));
        assert.ok(html.includes('repeat(2, 1fr)'));
    });

    it('timeline template returns valid HTML', () => {
        const html = generateHtml({
            template: 'timeline',
            title: 'History',
            items: [{ name: 'Step 1', description: 'First' }, { name: 'Step 2' }],
        });
        assert.ok(html.includes('<!DOCTYPE html>'));
        assert.ok(html.includes('History'));
        assert.ok(html.includes('Step 1'));
    });

    it('throws on unknown template', () => {
        assert.throws(
            () => generateHtml({ template: 'nonexistent', title: 'X', items: [] }),
            /Unknown template "nonexistent"/
        );
    });

    it('escapes HTML special characters', () => {
        const html = generateHtml({
            template: 'list-cards',
            title: '<script>alert("xss")</script>',
            items: [{ name: 'A & B "quoted"' }],
        });
        assert.ok(!html.includes('<script>alert'));
        assert.ok(html.includes('&lt;script&gt;'));
        assert.ok(html.includes('A &amp; B &quot;quoted&quot;'));
    });
});

describe('generateImage success', () => {
    it('saves PNG and returns absolute path', async () => {
        const testOutput = path.join(os.tmpdir(), `gen-test-${Date.now()}.png`);
        const fakeB64 = TINY_PNG.toString('base64');
        const origFetch = globalThis.fetch;

        globalThis.fetch = async () => ({
            ok: true,
            json: async () => ({ data: [{ b64_json: fakeB64 }] }),
            text: async () => '',
        });

        try {
            delete process.env.IMAGE_UPLOAD_PROVIDER;
            const result = await generateImage('a cute cat', testOutput);
            assert.ok(path.isAbsolute(result));
            assert.ok(fs.existsSync(result));
            const written = fs.readFileSync(result);
            assert.deepEqual(written, TINY_PNG);
        } finally {
            globalThis.fetch = origFetch;
            if (fs.existsSync(testOutput)) fs.unlinkSync(testOutput);
        }
    });
});
