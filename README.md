# 🦞 OpenClaw Skill: Infographic Generator

A professional OpenClaw skill that enables AI agents to automatically design and generate high-quality infographics, newsletters, and posters in Vietnamese using the best available image generation models (Recraft v3, Flux Ultra, Ideogram, etc.) routed via **9Router**.

---

## ✨ Features

- 🧠 **Dynamic Model Selection**: Queries 9Router's active image models and automatically selects the highest priority model available (falls back gracefully if models are offline).
- 📐 **Flexible Layouts & Ratios**: Supports Square (1:1), Vertical (2:3), and Landscape (16:9) aspect ratios based on natural language instructions.
- 🎨 **3 Curated Design Styles**: News Editorial, Pastel Guide Cards, and Neo-Brutalism — each with structured prompt templates.
- 🇻🇳 **Vietnamese Text Guidelines**: Font and diacritic rules to maximize correct rendering (titles 3-5 words, UPPERCASE preferred, "exactly as written" enforcement).
- 📤 **Chat Integration**: After generation, the agent sends the image directly into the chat via OpenClaw's `message` tool.
- ☁️ **Optional Public URL Upload**: Upload to Cloudflare R2 or ImgBB for a shareable public link. Off by default, graceful degradation on failure.
- ⚙️ **Automatic API Configuration**: Resolves 9Router API keys and base URLs from `openclaw.json` or environment variables.

---

## 📋 Prerequisites

- **Node.js** v18 or higher (uses built-in `fetch` and `crypto`)
- **9Router** accessible from the runtime environment
- Valid API credentials in `openclaw.json` or environment variables

---

## 📦 Installation

### Production (OpenClaw workspace)

```bash
openclaw skills install infographic-generator
```

### Development (link mode — changes reflect immediately)

```bash
# Clone the repo
git clone https://github.com/dongphuongman/openclaw-skill-infographic.git
cd openclaw-skill-infographic

# Link into your OpenClaw workspace (no reinstall needed on each edit)
openclaw skills install --link /path/to/openclaw-skill-infographic
```

---

## 🔑 Configuration

### Step 1: 9Router API (required)

The script reads 9Router credentials in this order of priority:

1. **`openclaw.json`** (auto-discovered by walking up from `cwd`, max 5 levels):
   ```json
   {
     "models": {
       "providers": {
         "9router": {
           "apiKey": "your-9router-api-key",
           "baseUrl": "http://9router:20128/v1"
         }
       }
     }
   }
   ```

2. **Environment variables** (override `openclaw.json` if set):

   | Variable | Description | Default |
   |---|---|---|
   | `NINE_ROUTER_API_KEY` | Your 9Router API token | _(empty)_ |
   | `NINE_ROUTER_BASE_URL` | 9Router API endpoint | `http://9router:20128/v1` |

> **Running outside Docker?**
> The default base URL `http://9router:20128` is a Docker-internal hostname.
> Override it when developing locally:
> ```bash
> export NINE_ROUTER_BASE_URL="http://localhost:20128/v1"
> ```

### Step 2: Public URL Upload (optional)

By default, upload is **off**. Set `IMAGE_UPLOAD_PROVIDER` to enable.

#### Option A: Cloudflare R2

Best for production — you own the data, zero egress fees, custom domain support.

**Setup steps:**

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/) > R2.
2. Create a bucket (e.g., `infographic-images`).
3. Enable public access: Bucket Settings > Public Access > Enable.
   - Note the public URL (e.g., `https://pub-abc123.r2.dev`), or connect a custom domain.
4. Create an API token: R2 > Manage R2 API Tokens > Create API Token.
   - Permission: Object Read & Write.
   - Copy the **Access Key ID** and **Secret Access Key**.
5. Note your **Account ID** from the Cloudflare dashboard URL or Overview page.

**Environment variables:**

| Variable | Description | Example |
|---|---|---|
| `IMAGE_UPLOAD_PROVIDER` | Set to `r2` | `r2` |
| `R2_ACCESS_KEY_ID` | API token Access Key ID | `a1b2c3d4e5f6...` |
| `R2_SECRET_ACCESS_KEY` | API token Secret Access Key | `x9y8z7w6v5u4...` |
| `R2_ACCOUNT_ID` | Cloudflare Account ID | `1a2b3c4d5e6f...` |
| `R2_BUCKET` | Bucket name | `infographic-images` |
| `R2_PUBLIC_URL` | Public URL prefix (no trailing `/`) | `https://img.example.com` |

**Docker Compose example:**

```yaml
services:
  openclaw:
    environment:
      IMAGE_UPLOAD_PROVIDER: r2
      R2_ACCESS_KEY_ID: a1b2c3d4e5f6
      R2_SECRET_ACCESS_KEY: x9y8z7w6v5u4
      R2_ACCOUNT_ID: 1a2b3c4d5e6f
      R2_BUCKET: infographic-images
      R2_PUBLIC_URL: https://img.example.com
```

Uploaded files are stored under `infographic/<timestamp>-<filename>.png`.

#### Option B: ImgBB

Best for quick setup — free, no infrastructure to manage.

**Setup steps:**

1. Go to [https://api.imgbb.com/](https://api.imgbb.com/).
2. Sign up or log in.
3. Copy your API key from the dashboard.

**Environment variables:**

| Variable | Description | Example |
|---|---|---|
| `IMAGE_UPLOAD_PROVIDER` | Set to `imgbb` | `imgbb` |
| `IMGBB_API_KEY` | Your ImgBB API key | `abc123def456...` |
| `IMGBB_EXPIRATION` | Auto-delete after N seconds (optional) | `15552000` (180 days) |

**Docker Compose example:**

```yaml
services:
  openclaw:
    environment:
      IMAGE_UPLOAD_PROVIDER: imgbb
      IMGBB_API_KEY: abc123def456
```

> **Graceful degradation**: If upload fails for any reason, the image is still saved locally and sent to chat. Only a warning is logged — the skill never crashes due to upload errors.

---

## 🛠️ Usage

### How it works (3-step flow)

```
User request ──> Agent builds prompt ──> exec: image-generator.js
                                              │
                                              ├── (a) Save PNG locally
                                              ├── (b) Upload to R2/ImgBB (if enabled)
                                              └── stdout: file path + public URL
                                                    │
                                          Agent reads stdout
                                                    │
                                          message(action="send", media="<path>")
                                                    │
                                          Image appears in chat
```

### Running manually (CLI)

```bash
node skills/infographic-generator/image-generator.js "<prompt>" [output_path]
```

- `<prompt>` — Detailed English prompt describing the infographic (required).
- `[output_path]` — Output file path (default: `image.png`).

### Examples

**Basic (inside Docker, default config):**

```bash
node skills/infographic-generator/image-generator.js \
  "An infographic poster with square aspect ratio. At the top, the main title in clean bold Arial font reads: 'MẸO TIẾT KIỆM' exactly as written, preserving all Vietnamese diacritical marks. 3x3 numbered grid layout with rounded pastel cards." \
  meo-tiet-kiem.png
```

**Outside Docker with R2 upload:**

```bash
NINE_ROUTER_BASE_URL="http://localhost:20128/v1" \
NINE_ROUTER_API_KEY="your-key" \
IMAGE_UPLOAD_PROVIDER="r2" \
R2_ACCESS_KEY_ID="..." \
R2_SECRET_ACCESS_KEY="..." \
R2_ACCOUNT_ID="..." \
R2_BUCKET="infographic-images" \
R2_PUBLIC_URL="https://img.example.com" \
node image-generator.js "A vertical poster..." poster.png
```

### Expected output

```
[ImageGen] Generating: "..." using model "recraft-v3"...
[ImageGen] Saved image to: /workspace/skills/infographic-generator/poster.png
[ImageGen] Public URL: https://img.example.com/infographic/1784967030377-poster.png
```

If upload is disabled, only the first two lines appear.
If upload fails, a warning replaces the third line:

```
[ImageGen] Upload failed (image saved locally): R2 403: Forbidden
```

---

## 🧪 Testing

```bash
npm test
```

Runs 11 tests covering:

| Test | What it verifies |
|---|---|
| `s3Hash` / `s3Hmac` | Crypto helper correctness |
| File name sanitization | Vietnamese/special chars replaced with `_` in R2 object keys |
| Upload disabled | No upload call when `IMAGE_UPLOAD_PROVIDER` is unset |
| R2 upload failure | Script does not crash, local file preserved |
| ImgBB upload failure | Script does not crash, local file preserved |
| Missing R2 config | Throws clear error message |
| Missing ImgBB config | Throws clear error message |
| Generation success | PNG saved, absolute path returned |

---

## 🎨 Design Styles

The SKILL.md includes prompt templates for 3 styles. See [SKILL.md](SKILL.md) for full details.

| Style | Best for | Key prompt keywords |
|---|---|---|
| News Editorial | Professional reports, news | `news editorial, newspaper grid layout, serif headers` |
| Pastel Guide | Step-by-step guides, tips | `3x3 numbered grid, rounded pastel cards, cartoon mascot` |
| Neo-Brutalism | Bold social media content | `thick dark borders, hard black drop shadows, bright vibrant` |

---

## 🔤 Vietnamese Text Tips

Image generation models can render Vietnamese text but **cannot guarantee 100% correct diacritics**. To maximize accuracy:

- Keep titles to **3-5 words** and write in **UPPERCASE**
- Keep card labels to **2-4 words**
- Use safe fonts: **Arial, Inter, Montserrat, Roboto**
- Add `"exactly as written, preserving all Vietnamese diacritical marks"` after each text block in the prompt
- Avoid: `decorative, script, handwritten, gothic, calligraphy` fonts

See section 5 of [SKILL.md](SKILL.md) for the complete ruleset.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

<div align="center">

Originally made by [tuanminhhole](https://github.com/tuanminhhole) · Fork maintained by [dongphuongman](https://github.com/dongphuongman)

</div>
