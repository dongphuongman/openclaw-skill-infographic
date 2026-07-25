# Changelog

## 1.2.0 (2026-07-25)

### Added
- **HTML template mode** (`--mode html`): Generate infographics from structured JSON data using 4 built-in templates (`food-guide`, `list-cards`, `grid`, `timeline`) with 4 color palettes (`warm`, `cool`, `pastel`, `bold`).
- **`generateFromHtml()`** function: Programmatic API for HTML mode with optional Puppeteer PNG rendering.
- **`generateHtml()`** re-exported from `image-generator.js` for convenience.
- **SKILL.md section 6**: When to use AI vs HTML, JSON schema examples for each template, palette guide.
- **6 new tests**: Template output validation, unknown template error, HTML escaping / XSS prevention.

### Changed
- CLI now accepts `--mode html '<JSON>' [output]` in addition to the original `"<prompt>" [output]` syntax.
- `module.exports` now includes `generateFromHtml` and `generateHtml`.

---

## 1.1.0 (2026-07-25)

Fork by [dongphuongman](https://github.com/dongphuongman) from [tuanminhhole/openclaw-skill-infographic](https://github.com/tuanminhhole/openclaw-skill-infographic).

### Added
- **Chat integration**: SKILL.md now instructs the agent to send the generated image via `message(action="send")` after generation.
- **Public URL upload**: Optional upload to Cloudflare R2 or ImgBB via `IMAGE_UPLOAD_PROVIDER` env var. Graceful degradation on failure.
- **Vietnamese text improvements**: Titles capped at 3-5 words, prefer UPPERCASE, card labels 2-4 words, added "exactly as written" diacritics enforcement in prompt template.
- **Tests**: 11 tests covering crypto helpers, upload providers, graceful degradation, and file name sanitization.

### Changed
- Script now logs absolute file path (instead of relative) for easier agent integration.
- Footer is now optional (removed hardcoded author signature).
- Refactored script to export functions for testability (`require.main` guard).
- Honest diacritic disclaimer: "can render, not guaranteed 100%".

### Removed
- Hardcoded footer text "designed by Williams - trợ lý của tuanminhhole".
