# OpenClaw Skill: Infographic Generator

Skill cho OpenClaw giup AI agent tu dong tao infographic, poster va banner tieng Viet chat luong cao. Ho tro 2 che do:

- **Che do AI** (mac dinh) — Goi API tao anh qua 9Router (Recraft v3, Flux Ultra, Ideogram, ...). Co hinh minh hoa AI nhung co the sai dau tieng Viet.
- **Che do HTML** (`--mode html`) — Render tu template HTML co san. Chu tieng Viet 100% chinh xac, nhanh, mien phi, khong can API.

---

## Tinh nang

- **Tu dong chon model**: Truy van danh sach model anh dang hoat dong tren 9Router, tu dong chon model co uu tien cao nhat. Neu model offline thi fallback sang model tiep theo.
- **Che do HTML template**: 4 template co san (`food-guide`, `list-cards`, `grid`, `timeline`) voi 4 bang mau (`warm`, `cool`, `pastel`, `bold`). Render tieng Viet chinh xac 100%. Neu co Puppeteer thi tu dong xuat PNG.
- **Ty le khung hinh linh hoat**: Ho tro vuong (1:1), doc (2:3), ngang (16:9) thong qua prompt.
- **3 phong cach thiet ke AI**: Tin tuc bao chi, Cam nang hoat hinh 2D, Neo-Brutalism — moi phong cach co prompt template rieng.
- **Gui anh vao chat**: Sau khi tao xong, agent tu dong gui anh vao cuoc tro chuyen qua tool `message` cua OpenClaw.
- **Upload anh len cloud** (tuy chon): Ho tro Cloudflare R2 hoac ImgBB. Mac dinh tat. Neu upload that bai, anh van duoc luu local binh thuong.
- **Tu dong doc cau hinh**: Doc API key va base URL tu `openclaw.json` hoac bien moi truong.

---

## Yeu cau he thong

- **Node.js** phien ban 18 tro len (su dung `fetch` va `crypto` co san)
- **9Router** truy cap duoc tu moi truong chay (chi can cho che do AI)
- Thong tin xac thuc hop le trong `openclaw.json` hoac bien moi truong (chi can cho che do AI)
- **Puppeteer** (tuy chon) — chi can neu muon tu dong render HTML thanh PNG

---

## Cai dat

### Cai dat tren OpenClaw (production)

```bash
openclaw skills install infographic-generator
```

### Cai dat de phat trien (link mode — thay doi cap nhat ngay)

```bash
# Clone repo ve may
git clone https://github.com/dongphuongman/openclaw-skill-infographic.git
cd openclaw-skill-infographic

# Link vao workspace OpenClaw (khong can cai lai moi khi sua code)
openclaw skills install --link /path/to/openclaw-skill-infographic
```

---

## Cau hinh

### Buoc 1: Cau hinh 9Router API (bat buoc cho che do AI)

> **Luu y**: Neu chi dung che do HTML (`--mode html`), ban co the bo qua buoc nay.

Script doc thong tin 9Router theo thu tu uu tien:

**Cach 1: Qua file `openclaw.json`**

File nay duoc tu dong tim bang cach di nguoc tu thu muc hien tai len toi da 5 cap. Script cung tim trong thu muc `.openclaw/`.

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

**Cach 2: Qua bien moi truong**

Bien moi truong se ghi de gia tri trong `openclaw.json` neu ca hai deu co.

| Bien | Mo ta | Gia tri mac dinh |
|---|---|---|
| `NINE_ROUTER_API_KEY` | API token cua 9Router | _(trong)_ |
| `NINE_ROUTER_BASE_URL` | Dia chi API endpoint cua 9Router | `http://9router:20128/v1` |

**Chay ngoai Docker?**

Dia chi mac dinh `http://9router:20128` la hostname noi bo Docker. Khi phat trien tren may local, ghi de bang:

```bash
export NINE_ROUTER_BASE_URL="http://localhost:20128/v1"
```

### Buoc 2: Cau hinh upload anh len cloud (tuy chon)

Mac dinh upload **tat**. Dat bien `IMAGE_UPLOAD_PROVIDER` de bat.

#### Phuong an A: Cloudflare R2

Phu hop cho production — du lieu do ban quan ly, khong mat phi egress, ho tro ten mien rieng.

**Cac buoc thiet lap:**

1. Dang nhap [Cloudflare Dashboard](https://dash.cloudflare.com/) > vao muc R2.
2. Tao bucket moi (vi du: `infographic-images`).
3. Bat truy cap cong khai: Bucket Settings > Public Access > Enable.
   - Ghi lai URL cong khai (vi du: `https://pub-abc123.r2.dev`), hoac ket noi ten mien rieng.
4. Tao API token: R2 > Manage R2 API Tokens > Create API Token.
   - Quyen: Object Read & Write.
   - Sao chep **Access Key ID** va **Secret Access Key**.
5. Ghi lai **Account ID** tu URL dashboard hoac trang Overview.

**Bien moi truong can thiet:**

| Bien | Mo ta | Vi du |
|---|---|---|
| `IMAGE_UPLOAD_PROVIDER` | Dat la `r2` | `r2` |
| `R2_ACCESS_KEY_ID` | Access Key ID cua API token | `a1b2c3d4e5f6...` |
| `R2_SECRET_ACCESS_KEY` | Secret Access Key cua API token | `x9y8z7w6v5u4...` |
| `R2_ACCOUNT_ID` | Account ID cua Cloudflare | `1a2b3c4d5e6f...` |
| `R2_BUCKET` | Ten bucket | `infographic-images` |
| `R2_PUBLIC_URL` | URL cong khai (khong co `/` cuoi) | `https://img.example.com` |

**Vi du Docker Compose:**

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

File upload duoc luu tai duong dan `infographic/<timestamp>-<ten_file>.png`.

#### Phuong an B: ImgBB

Phu hop de thiet lap nhanh — mien phi, khong can quan ly ha tang.

**Cac buoc thiet lap:**

1. Truy cap [https://api.imgbb.com/](https://api.imgbb.com/).
2. Dang ky hoac dang nhap.
3. Sao chep API key tu trang dashboard.

**Bien moi truong can thiet:**

| Bien | Mo ta | Vi du |
|---|---|---|
| `IMAGE_UPLOAD_PROVIDER` | Dat la `imgbb` | `imgbb` |
| `IMGBB_API_KEY` | API key cua ImgBB | `abc123def456...` |
| `IMGBB_EXPIRATION` | Tu dong xoa sau N giay (tuy chon) | `15552000` (180 ngay) |

**Vi du Docker Compose:**

```yaml
services:
  openclaw:
    environment:
      IMAGE_UPLOAD_PROVIDER: imgbb
      IMGBB_API_KEY: abc123def456
```

> **Xu ly loi an toan**: Neu upload that bai vi bat ky ly do gi, anh van duoc luu tai may va gui vao chat binh thuong. Chi co canh bao duoc ghi log — skill khong bao gio crash do loi upload.

### Buoc 3: Cai dat Puppeteer (tuy chon, chi dung cho che do HTML)

Neu muon tu dong render HTML thanh file PNG, cai them Puppeteer:

```bash
npm install puppeteer
```

Neu khong cai Puppeteer, script van hoat dong binh thuong — chi xuat file `.html`. Ban co the mo file HTML trong trinh duyet de xem ket qua.

---

## Cach su dung

### Quy trinh hoat dong tong quan

```
                          Che do AI (mac dinh)
                          ┌──────────────────────────────────┐
                          │ Goi 9Router API tao anh           │
Nguoi dung yeu cau ──>    │ Luu PNG tai may                   │
Agent xu ly          ──>  │ Upload len R2/ImgBB (neu bat)     │
                          │ In duong dan file + URL            │
                          └──────────────────────────────────┘
                                        │
                          Agent doc stdout
                                        │
                          message(action="send", media="<path>")
                                        │
                          Anh hien trong chat

                          Che do HTML (--mode html)
                          ┌──────────────────────────────────┐
                          │ Doc JSON du lieu                   │
                          │ Render HTML tu template            │
                          │ Luu file .html                     │
                          │ Render PNG qua Puppeteer (neu co)  │
                          │ Upload PNG (neu co + bat upload)   │
                          └──────────────────────────────────┘
```

### Chay bang dong lenh (CLI)

#### Che do AI (mac dinh)

```bash
node skills/infographic-generator/image-generator.js "<prompt tieng Anh>" [duong_dan_output]
```

- `<prompt>` — Prompt tieng Anh mo ta chi tiet infographic (bat buoc).
- `[duong_dan_output]` — Duong dan file xuat ra (mac dinh: `image.png`).

#### Che do HTML

```bash
# Tu JSON inline
node skills/infographic-generator/image-generator.js --mode html '<JSON>' [duong_dan_output]

# Tu file JSON
node skills/infographic-generator/image-generator.js --mode html data.json [duong_dan_output]
```

- Chap nhan chuoi JSON truc tiep hoac duong dan toi file `.json`.
- Xuat file `.html`. Neu co Puppeteer, dong thoi xuat file `.png`.
- Xem muc [Template va bang mau](#template-va-bang-mau) ben duoi de biet cau truc JSON.

### Vi du cu the

**Co ban (trong Docker, cau hinh mac dinh):**

```bash
node skills/infographic-generator/image-generator.js \
  "An infographic poster with square aspect ratio. At the top, the main title in clean bold Arial font reads: 'MEO TIET KIEM' exactly as written, preserving all Vietnamese diacritical marks. 3x3 numbered grid layout with rounded pastel cards." \
  meo-tiet-kiem.png
```

**Ngoai Docker voi upload R2:**

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

**Che do HTML voi JSON inline:**

```bash
node image-generator.js --mode html '{
  "template": "food-guide",
  "color": "warm",
  "title": "AM THUC VIET NAM",
  "items": [
    {"name": "Pho Ha Noi", "emoji": "🍜", "price": "45.000d"}
  ]
}' menu.png
```

**Che do HTML tu file JSON:**

```bash
node image-generator.js --mode html du-lieu.json infographic.png
```

### Ket qua output mong doi

**Che do AI:**

```
[ImageGen] Generating: "..." using model "recraft-v3"...
[ImageGen] Saved image to: /workspace/skills/infographic-generator/poster.png
[ImageGen] Public URL: https://img.example.com/infographic/1784967030377-poster.png
```

Neu upload tat, chi hien 2 dong dau.
Neu upload that bai, dong thu 3 la canh bao:

```
[ImageGen] Upload failed (image saved locally): R2 403: Forbidden
```

**Che do HTML (co Puppeteer):**

```
[ImageGen] Saved HTML to: /workspace/skills/infographic-generator/menu.html
[ImageGen] Saved PNG to: /workspace/skills/infographic-generator/menu.png
```

**Che do HTML (khong co Puppeteer):**

```
[ImageGen] Saved HTML to: /workspace/skills/infographic-generator/menu.html
[ImageGen] puppeteer not installed — skipping PNG render. Open the HTML file in a browser.
```

---

## Template va bang mau

### 4 template co san

| Template | Mo ta | Phu hop cho |
|---|---|---|
| `food-guide` | Menu am thuc voi header, strip danh muc, danh sach mon an | Menu nha hang, cam nang am thuc, du lich |
| `list-cards` | Danh sach co danh so voi card mau pastel | Meo vat, top N, danh sach kiem tra |
| `grid` | Luoi o vuong (2-4 cot tuy chinh) | Ky nang, so do, phan loai |
| `timeline` | Dong thoi gian doc voi cham tron va duong noi | Lich su, quy trinh, lo trinh |

### 4 bang mau co san

| Bang mau | Mau sac chinh | Phu hop cho |
|---|---|---|
| `warm` | Do, vang, nau am | Am thuc, du lich, lifestyle |
| `cool` | Xanh duong, xanh nhat | Cong nghe, giao duc, lich su |
| `pastel` | Tim nhat, pastel mem | Tips, huong dan, suc khoe |
| `bold` | Cam, vang, do tuoi | Social media, tre trung, noi bat |

### Cau truc JSON chung

```json
{
  "template": "ten-template",
  "color": "ten-bang-mau",
  "title": "TIEU DE CHINH",
  "subtitle": "Mo ta phu (tuy chon)",
  "items": [
    {
      "name": "Ten muc",
      "emoji": "🎯",
      "description": "Mo ta chi tiet (tuy chon)"
    }
  ],
  "footer": "Dong cuoi trang (tuy chon)"
}
```

**Truong rieng theo template:**

- `food-guide`: `flag`, `titleAccent`, `categories`, moi item co the co `origin` va `price`
- `grid`: `columns` (so cot, mac dinh 3)

Xem day du vi du JSON cho tung template tai [SKILL.md](SKILL.md) muc 6.

---

## 3 phong cach thiet ke AI

SKILL.md co prompt template cho 3 phong cach. Xem chi tiet tai [SKILL.md](SKILL.md).

| Phong cach | Phu hop cho | Tu khoa prompt chinh |
|---|---|---|
| Tin tuc bao chi | Bao cao, tin tuc chuyen nghiep | `news editorial, newspaper grid layout, serif headers` |
| Cam nang pastel | Huong dan tung buoc, meo vat | `3x3 numbered grid, rounded pastel cards, cartoon mascot` |
| Neo-Brutalism | Noi dung social media noi bat | `thick dark borders, hard black drop shadows, bright vibrant` |

---

## Meo xu ly chu tieng Viet (che do AI)

Model tao anh co the render chu tieng Viet nhung **khong dam bao 100% dung dau**. De tang ty le chinh xac:

- Tieu de giu **3-5 tu** va viet **IN HOA**
- Nhan moi o/card giu **2-4 tu**
- Dung font an toan: **Arial, Inter, Montserrat, Roboto**
- Them cum `"exactly as written, preserving all Vietnamese diacritical marks"` sau moi doan text trong prompt
- **Tranh** cac font: `decorative, script, handwritten, gothic, calligraphy`
- Neu chu sai dau, chay lai script de tao lai anh

> **Meo**: Neu noi dung chu yeu la text tieng Viet (menu, danh sach, huong dan), hay dung **che do HTML** (`--mode html`) de dam bao chu 100% chinh xac.

Xem day du quy tac tai muc 5 cua [SKILL.md](SKILL.md).

---

## Chay test

```bash
npm test
```

Chay 17 test bao gom:

| Test | Kiem tra |
|---|---|
| `s3Hash` / `s3Hmac` | Ham crypto hoat dong dung |
| Lam sach ten file | Ky tu tieng Viet va ky tu dac biet duoc thay bang `_` trong key R2 |
| Upload tat | Khong goi upload khi `IMAGE_UPLOAD_PROVIDER` chua dat |
| R2 upload loi | Script khong crash, file local van con |
| ImgBB upload loi | Script khong crash, file local van con |
| Thieu cau hinh R2 | Throw loi voi thong bao ro rang |
| Thieu cau hinh ImgBB | Throw loi voi thong bao ro rang |
| Tao anh thanh cong | PNG duoc luu, tra ve duong dan tuyet doi |
| `generateHtml` food-guide | Tra ve HTML hop le voi cac mon an |
| `generateHtml` list-cards | Tra ve HTML hop le voi card danh so |
| `generateHtml` grid | Tra ve HTML hop le voi dung so cot |
| `generateHtml` timeline | Tra ve HTML hop le voi cac buoc |
| Template khong ton tai | Throw loi mo ta ro rang |
| HTML escaping | Ky tu XSS duoc escape dung cach |

---

## Cau truc du an

```
openclaw-skill-infographic/
├── image-generator.js      # Script chinh — che do AI + HTML, CLI entry point
├── html-templates.js        # 4 template HTML + 4 bang mau + ham generateHtml()
├── SKILL.md                 # Huong dan cho AI agent (OpenClaw doc file nay)
├── package.json             # Metadata, scripts
├── tests/
│   └── image-generator.test.js  # 17 test (Node.js built-in test runner)
├── CHANGELOG.md
├── README.md                # File nay
└── LICENSE
```

---

## Giay phep

Du an su dung giay phep MIT — xem file [LICENSE](LICENSE) de biet chi tiet.
