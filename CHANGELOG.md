# Changelog

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
