const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Find openclaw.json path dynamically by walking up
let openclawJsonPath = '';
let currentDir = process.cwd();
for (let i = 0; i < 5; i++) {
    const candidate = path.join(currentDir, 'openclaw.json');
    if (fs.existsSync(candidate)) {
        openclawJsonPath = candidate;
        break;
    }
    const candidateInDot = path.join(currentDir, '.openclaw', 'openclaw.json');
    if (fs.existsSync(candidateInDot)) {
        openclawJsonPath = candidateInDot;
        break;
    }
    const parent = path.dirname(currentDir);
    if (parent === currentDir) break;
    currentDir = parent;
}

// Resolve API Key and Base URL from openclaw.json or env vars
let apiKey = process.env.NINE_ROUTER_API_KEY || ''; // default fallback key
let baseUrl = process.env.NINE_ROUTER_BASE_URL || 'http://9router:20128/v1'; // default fallback URL
if (openclawJsonPath) {
    try {
        const config = JSON.parse(fs.readFileSync(openclawJsonPath, 'utf8'));
        const provider = config.models?.providers?.['9router'];
        if (provider) {
            if (provider.apiKey) apiKey = provider.apiKey;
            if (provider.baseUrl) baseUrl = provider.baseUrl;
        }
    } catch (e) {}
}

const modelPriorityPatterns = [
    /recraft-?v3/i,
    /flux-pro-?(v1\.1-)?ultra/i,
    /flux-kontext-max/i,
    /flux-pro-?(v1\.1)?/i,
    /flux-kontext-pro/i,
    /recraft-?v2/i,
    /recraft/i,
    /ideogram-?v2/i,
    /ideogram/i,
    /runway.*turbo/i,
    /runway/i,
    /flux-2-dev/i,
    /flux-2-klein-9b/i,
    /flux-2-klein-4b/i,
    /flux-?(1-)?dev/i,
    /phoenix-1\.0/i,
    /phoenix/i,
    /lucid-origin/i,
    /dall-e-3/i,
    /stable-image-ultra/i,
    /sd3\.5-large-turbo/i,
    /sd3\.5-large/i,
    /stable-diffusion-v35/i,
    /sd3\.5/i,
    /stable-image-core/i,
    /stable-diffusion-3/i,
    /sd3/i,
    /sd3\.5-medium/i,
    /flux-?(1-)?schnell/i,
    /dreamshaper/i,
    /grok/i,
    /gpt/i,
    /minimax/i,
    /gemini-3\.1/i,
    /gemini-3/i,
    /gemini-2\.5/i,
    /gemini/i,
    /stable-diffusion-xl-lightning/i,
    /stable-diffusion-xl-base/i,
    /sdxl/i,
    /stable-diffusion/i,
    /sdwebui/i,
    /comfyui/i,
];

// --- R2 Upload (optional, env-toggled) ---

function s3Hmac(key, data) {
    return crypto.createHmac('sha256', key).update(data).digest();
}

function s3Hash(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}

async function uploadToR2(filePath, fileName) {
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretKey = process.env.R2_SECRET_ACCESS_KEY;
    const accountId = process.env.R2_ACCOUNT_ID;
    const bucket = process.env.R2_BUCKET;
    const publicUrl = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '');

    if (!accessKeyId || !secretKey || !accountId || !bucket || !publicUrl) {
        throw new Error('Missing R2 config (need R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ACCOUNT_ID, R2_BUCKET, R2_PUBLIC_URL)');
    }

    const body = fs.readFileSync(filePath);
    const host = `${accountId}.r2.cloudflarestorage.com`;
    const region = 'auto';
    const service = 's3';
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const objectKey = `infographic/${Date.now()}-${safeName}`;
    const canonicalUri = `/${bucket}/${objectKey}`;
    const contentType = 'image/png';

    const now = new Date();
    const amzDate = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const dateStamp = amzDate.slice(0, 8);
    const payloadHash = s3Hash(body);

    const canonicalHeaders =
        `content-type:${contentType}\n` +
        `host:${host}\n` +
        `x-amz-content-sha256:${payloadHash}\n` +
        `x-amz-date:${amzDate}\n`;
    const signedHeaders = 'content-type;host;x-amz-content-sha256;x-amz-date';

    const canonicalRequest = [
        'PUT', canonicalUri, '', canonicalHeaders, signedHeaders, payloadHash
    ].join('\n');

    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
    const stringToSign = [
        'AWS4-HMAC-SHA256', amzDate, credentialScope, s3Hash(canonicalRequest)
    ].join('\n');

    let signingKey = s3Hmac('AWS4' + secretKey, dateStamp);
    signingKey = s3Hmac(signingKey, region);
    signingKey = s3Hmac(signingKey, service);
    signingKey = s3Hmac(signingKey, 'aws4_request');
    const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');

    const authorization = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const res = await fetch(`https://${host}${canonicalUri}`, {
        method: 'PUT',
        headers: {
            'Content-Type': contentType,
            'x-amz-content-sha256': payloadHash,
            'x-amz-date': amzDate,
            'Authorization': authorization,
        },
        body: body,
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`R2 ${res.status}: ${text.slice(0, 200)}`);
    }

    return `${publicUrl}/${objectKey}`;
}

async function uploadToImgBB(filePath) {
    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey) {
        throw new Error('Missing IMGBB_API_KEY');
    }

    const imageData = fs.readFileSync(filePath).toString('base64');
    const params = new URLSearchParams();
    params.append('key', apiKey);
    params.append('image', imageData);

    const expiration = process.env.IMGBB_EXPIRATION;
    if (expiration) params.append('expiration', expiration);

    const res = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: params,
    });

    const json = await res.json();
    if (!json.success) {
        throw new Error(`ImgBB ${json.status_code || res.status}: ${json.error?.message || JSON.stringify(json.error)}`);
    }

    return json.data.display_url;
}

async function generateImage(prompt, outputPath) {
    let selectedModel = '';
    try {
        const modelsResponse = await fetch(`${baseUrl}/models/image`, {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        const modelsData = await modelsResponse.json();
        if (modelsData && Array.isArray(modelsData.data) && modelsData.data.length > 0) {
            const modelIds = modelsData.data
                .map(m => m.id)
                .filter(id => !/img2img|inpainting|controlnet|edit|upscale|refiner/i.test(id));
            for (const pattern of modelPriorityPatterns) {
                const found = modelIds.find(id => pattern.test(id));
                if (found) { selectedModel = found; break; }
            }
            if (!selectedModel && modelIds.length > 0) selectedModel = modelIds[0];
        }
    } catch (e) {
        console.warn('[ImageGen] Failed to auto-resolve active models, using fallback:', e.message);
    }

    if (!selectedModel) selectedModel = 'gemini/gemini-3.1-flash-image-preview';

    console.log(`[ImageGen] Generating: "${prompt}" using model "${selectedModel}"...`);
    const response = await fetch(`${baseUrl}/images/generations`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: selectedModel, prompt, n: 1, size: 'auto', response_format: 'b64_json'
        })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
    if (!data.data?.[0]?.b64_json) throw new Error('No image data returned');

    const buf = Buffer.from(data.data[0].b64_json, 'base64');
    const absoluteOutputPath = path.isAbsolute(outputPath) ? outputPath : path.join(process.cwd(), outputPath);
    fs.writeFileSync(absoluteOutputPath, buf);
    console.log(`[ImageGen] Saved image to: ${absoluteOutputPath}`);

    const uploadProvider = (process.env.IMAGE_UPLOAD_PROVIDER || '').toLowerCase();
    if (uploadProvider) {
        try {
            let url;
            if (uploadProvider === 'r2') {
                url = await uploadToR2(absoluteOutputPath, path.basename(outputPath));
            } else if (uploadProvider === 'imgbb') {
                url = await uploadToImgBB(absoluteOutputPath);
            } else {
                throw new Error(`Unknown upload provider: ${uploadProvider}`);
            }
            console.log(`[ImageGen] Public URL: ${url}`);
        } catch (uploadErr) {
            console.warn(`[ImageGen] Upload failed (image saved locally): ${uploadErr.message}`);
        }
    }

    return absoluteOutputPath;
}

// --- HTML mode ---

const { generateHtml } = require('./html-templates.js');

async function generateFromHtml(jsonInput, outputPath) {
    const data = typeof jsonInput === 'string' ? JSON.parse(jsonInput) : jsonInput;
    const html = generateHtml(data);
    const absoluteOutputPath = path.isAbsolute(outputPath) ? outputPath : path.join(process.cwd(), outputPath);
    const htmlPath = absoluteOutputPath.replace(/\.png$/i, '.html');
    fs.writeFileSync(htmlPath, html);
    console.log(`[ImageGen] Saved HTML to: ${htmlPath}`);

    let pngRendered = false;
    try {
        const puppeteer = require('puppeteer');
        const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.setViewport({ width: 800, height: 600 });
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const bodyHandle = await page.$('body');
        const box = await bodyHandle.boundingBox();
        await page.setViewport({ width: 800, height: Math.ceil(box.height) });
        await page.screenshot({ path: absoluteOutputPath, fullPage: true });
        await browser.close();
        console.log(`[ImageGen] Saved PNG to: ${absoluteOutputPath}`);
        pngRendered = true;
    } catch (e) {
        if (e.code === 'MODULE_NOT_FOUND') {
            console.log('[ImageGen] puppeteer not installed — skipping PNG render. Open the HTML file in a browser.');
        } else {
            console.warn(`[ImageGen] PNG render failed: ${e.message}`);
        }
    }

    if (pngRendered) {
        const uploadProvider = (process.env.IMAGE_UPLOAD_PROVIDER || '').toLowerCase();
        if (uploadProvider) {
            try {
                let url;
                if (uploadProvider === 'r2') {
                    url = await uploadToR2(absoluteOutputPath, path.basename(outputPath));
                } else if (uploadProvider === 'imgbb') {
                    url = await uploadToImgBB(absoluteOutputPath);
                } else {
                    throw new Error(`Unknown upload provider: ${uploadProvider}`);
                }
                console.log(`[ImageGen] Public URL: ${url}`);
            } catch (uploadErr) {
                console.warn(`[ImageGen] Upload failed (image saved locally): ${uploadErr.message}`);
            }
        }
    }

    return pngRendered ? absoluteOutputPath : htmlPath;
}

// --- CLI entry ---
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args[0] === '--mode' && args[1] === 'html') {
        const jsonInput = args[2];
        const outputPath = args[3] || 'output.png';
        if (!jsonInput) {
            console.error('Usage: node image-generator.js --mode html \'<JSON>\' [output_path]');
            console.error('       node image-generator.js --mode html data.json [output_path]');
            process.exit(1);
        }
        let jsonData = jsonInput;
        if (!jsonInput.startsWith('{') && fs.existsSync(jsonInput)) {
            jsonData = fs.readFileSync(jsonInput, 'utf8');
        }
        generateFromHtml(jsonData, outputPath).catch(e => {
            console.error(`[ImageGen] Error: ${e.message}`);
            process.exit(1);
        });
    } else {
        const prompt = args[0];
        const outputPath = args[1] || 'image.png';
        if (!prompt) {
            console.error('Usage: node image-generator.js "<prompt>" [output_path]');
            console.error('       node image-generator.js --mode html \'<JSON>\' [output_path]');
            process.exit(1);
        }
        generateImage(prompt, outputPath).catch(e => {
            console.error(`[ImageGen] Error: ${e.message}`);
            process.exit(1);
        });
    }
}

module.exports = { generateImage, generateFromHtml, generateHtml, uploadToR2, uploadToImgBB, s3Hash, s3Hmac };
