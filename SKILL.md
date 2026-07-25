---
name: infographic-generator
description: Tạo ảnh infographic, banner hoặc poster trực tiếp bằng 1 prompt gửi tới API tạo ảnh qua 9Router.
---
## 📋 0. QUY TRÌNH XÁC NHẬN THÔNG TIN BẮT BUỘC (MANDATORY)

Khi người dùng yêu cầu tạo ảnh, **bắt buộc** phải có đầy đủ các thông tin rõ ràng dưới đây. Nếu người dùng đưa ra yêu cầu chung chung hoặc thiếu bất kỳ yếu tố nào, bạn **phải hỏi lại để làm rõ** trước khi tiến hành tạo ảnh:

*   **Tiêu đề / Chủ đề chính**: Tiêu đề tiếng Việt cần viết lên ảnh (Ví dụ: *“10 điều nên làm vào mỗi buổi sáng”*).
*   **Nội dung chi tiết các mục**: Các ý nội dung để đưa vào các ô/phần của ảnh. (Lưu ý: Bạn có thể tự tìm kiếm thông tin qua web-search hoặc tự diễn giải chi tiết dựa trên chủ đề nếu người dùng đồng ý, nhưng cần xác nhận rõ).
*   **Phong cách thiết kế**: Chọn một trong các phong cách chính (Tin tức báo chí, Cẩm nang hoạt hình 2D, hay Layout Neo-Brutalism).
*   **Tỷ lệ khung hình / Layout**: (Ví dụ: Hình vuông 1:1, Poster dọc 2:3, hay Banner ngang 16:9).
*   **Dòng Footer** (tùy chọn): Dòng chữ bản quyền ở cạnh dưới nếu người dùng muốn (Ví dụ: *”designed by TênBot”*).

> [!IMPORTANT]
> **Tuyệt đối không tự tiện tạo ảnh khi chưa rõ các yếu tố trên.** Hãy phản hồi lịch sự, liệt kê các yếu tố còn thiếu và đưa ra các tùy chọn/ví dụ gợi ý để người dùng chọn nhanh.

---

Khi người dùng yêu cầu tạo ảnh infographic, tin tức, cẩm nang, hoặc poster bằng tiếng Việt, hãy sử dụng skill này để gọi trực tiếp API tạo ảnh qua script `image-generator.js`. Phương pháp này tạo ra các tác phẩm thiết kế đồng nhất và tuyệt đẹp chỉ bằng một câu prompt chi tiết duy nhất.

## 🚀 1. LỆNH THỰC THI

### Bước 1: Sinh ảnh
Gọi tool `exec` để chạy lệnh:
`node skills/infographic-generator/image-generator.js "<prompt chi tiết bằng tiếng Anh>" <tên_ảnh>.png`

_(Ví dụ: `node skills/infographic-generator/image-generator.js "A professional grid infographic..." output.png`)_

### Bước 2: Gửi ảnh vào chat (BẮT BUỘC)
Ngay sau khi script chạy thành công và in ra `[ImageGen] Saved image to: <path>`, bạn **phải** gọi tool `message` để gửi ảnh vào cuộc trò chuyện:

```
message(action="send", media="<đường dẫn tuyệt đối tới file PNG>")
```

Nếu script in ra đường dẫn tương đối (ví dụ `output.png`), hãy ghép với thư mục làm việc hiện tại để có đường dẫn tuyệt đối trước khi gọi `message`.

> [!IMPORTANT]
> **Không được bỏ qua bước gửi ảnh.** Nếu chỉ chạy script mà không gọi `message`, người dùng sẽ không thấy ảnh trong chat.

---

## 📐 2. QUY ĐỊNH KÍCH THƯỚC & TỶ LỆ (ASPECT RATIO)

Khi gọi API, mặc định kích thước là tỷ lệ **1:1** (hình vuông). Tuy nhiên, hãy tùy biến linh hoạt theo yêu cầu của người dùng bằng cách điều chỉnh từ khóa mô tả tỷ lệ và khung hình trong prompt:

- **Mặc định (1:1)**: Thêm từ khóa `square aspect ratio, 1:1 square canvas` vào prompt. Phù hợp cho các infographic dạng ô lưới hoặc bài đăng mạng xã hội thông thường.
- **Poster dọc (Vertical Poster)**: Thêm từ khóa `vertical poster aspect ratio, 2:3 portrait format, vertical infographic` vào prompt. Phù hợp cho cẩm nang chi tiết có nhiều mục (3-9 mục).
- **Landscape (16:9)**: Thêm từ khóa `16:9 landscape aspect ratio, wide horizontal banner` vào prompt. Phù hợp cho banner nằm ngang, ảnh bìa.

---

## ✍️ 3. FOOTER (TÙY CHỌN)

Nếu người dùng muốn thêm dòng chữ bản quyền ở cạnh dưới ảnh, hãy thêm vào cuối prompt:

- **Cách mô tả trong prompt**: Thêm vào cuối prompt mô tả chi tiết:
  _"At the bottom center of the image, there is a clean and tiny centered footer text that reads: '[NỘI DUNG FOOTER CỦA NGƯỜI DÙNG]'"_
- Nếu người dùng không yêu cầu footer, **bỏ qua** phần này.

---

## 🎨 4. BA PHONG CÁCH THIẾT KẾ CHỦ ĐẠO

Hãy chọn 1 trong 3 phong cách dưới đây tùy thuộc vào ngữ cảnh yêu cầu:

### Phong cách 1: Tin tức báo chí / News Editorial

- **Đặc điểm**: Bố cục chuyên nghiệp, chia nhiều cột dọc/ngang (multi-column), sử dụng các đường kẻ mỏng hoặc nét đứt mảnh để phân chia các ô tin tức rõ ràng.
- **Phông chữ**: Font tiêu đề Serif (có chân) sang trọng, font nội dung Sans-serif (không chân) hiện đại.
- **Minh họa**: Icon dạng vector phẳng (flat vector icons), tối giản, chuyên nghiệp.
- **Từ khóa prompt gợi ý**: `news editorial infographic style, newspaper grid layout, clear divider lines, minimal serif headers, flat vector icons, professional business theme, clean corporate colors.`

### Phong cách 2: Cẩm nang/Hướng dẫn chi tiết

- **Đặc điểm**: Bố cục lưới (ví dụ: 3x3 grid) gồm nhiều ô được đánh số thứ tự (1, 2, 3...). Mỗi ô có nền màu pastel nhẹ nhàng (như xanh lá nhạt, kem nhạt, vàng nhạt) với viền bo góc tròn mềm mại. Có hình mascot (như chú heo đất đeo kính, két sắt, nhân vật hoạt hình) xuất hiện làm điểm nhấn.
- **Phông chữ**: Font chữ tròn, thân thiện, rõ ràng.
- **Minh họa**: Icon hoạt hình 2D sống động, nhiều màu sắc.
- **Từ khóa prompt gợi ý**: `detailed guide infographic poster, 3x3 numbered grid layout, rounded pastel cards, cute 2D cartoon mascot, playful vector icons, warm cream background, clear numbered badges.`

### Phong cách 3: Layout Neo-Brutalism hoạt hình

- **Đặc điểm**: Đường viền đen dày nổi bật (thick dark borders), đổ bóng cứng màu đen (hard solid drop shadows), màu sắc tương phản mạnh mẽ (Neo-Brutalism), phong cách hoạt hình 2D phẳng, hiện đại và trẻ trung.
- **Phông chữ**: Font chữ in đậm, cá tính và không chân.
- **Minh họa**: Mascot và các icon phẳng nét vẽ dày cá tính.
- **Từ khóa prompt gợi ý**: `neo-brutalism infographic poster, vector cartoon flat 2D style, thick dark solid borders, hard black drop shadows, bright vibrant background cards (yellow, cyan, lime green, orange), playful modern bold typography.`

---

## 🔤 5. QUY TẮC PHÒNG TRÁNH LỖI FONT TIẾNG VIỆT

Mô hình tạo ảnh có thể ghi text tiếng Việt, nhưng **không đảm bảo đúng dấu 100%**. Các quy tắc dưới đây giúp **nâng tỉ lệ** render đúng — không loại bỏ hoàn toàn lỗi:

1. **Tiêu đề ngắn gọn (3–5 từ)**: Tiêu đề càng dài, tỉ lệ sai dấu càng cao. Ưu tiên rút gọn, ví dụ: *"Bí Kíp Tránh Nóng"* thay vì *"Bí Kíp Tránh Nóng Trong Mùa Hè Năm Nay"*.
2. **Viết HOA tiêu đề chính**: Chữ in hoa có nhiều khoảng trống hơn cho dấu, giảm lỗi clipping. Ví dụ: `'BÍ KÍP TRÁNH NÓNG'` thay vì `'bí kíp tránh nóng'`.
3. **Giới hạn nhãn mỗi ô (2–4 từ)**: Mỗi card/section chỉ nên có nhãn ngắn. Nội dung dài nên mô tả bằng hình minh họa thay vì text.
4. **Chỉ định phông chữ tiêu chuẩn**: Ghi rõ font hỗ trợ Unicode tiếng Việt: **Arial, Inter, Montserrat, Roboto, Plus Jakarta Sans, Fredoka** (chỉ cho phong cách hoạt hình).
   _Ví dụ: "in clean bold Arial font", "using modern Montserrat typeface"._
5. **Tránh phông chữ lạ**: Tuyệt đối **KHÔNG** dùng `decorative, script, handwritten, gothic, calligraphy, futuristic fonts` — hầu như không hỗ trợ tiếng Việt.
6. **Định dạng text rõ ràng**: Đặt text tiếng Việt trong nháy đơn và thêm cụm **"exactly as written, preserving all Vietnamese diacritical marks"** ngay sau.
   _Ví dụ: The main title in bold Arial font reads: 'BÍ KÍP TRÁNH NÓNG' exactly as written, preserving all Vietnamese diacritical marks._
7. **Xử lý khi dấu sai**: Nếu ảnh sinh ra bị sai dấu, hãy **chủ động đề xuất tạo lại** (chạy script lần nữa). Không cần người dùng yêu cầu — chất lượng text là ưu tiên.

---

## 🖥️ 6. CHẾ ĐỘ HTML (--mode html)

### Khi nào dùng AI vs HTML?

| | AI (mặc định) | HTML (--mode html) |
|---|---|---|
| **Ưu điểm** | Hình minh họa phong phú, mascot, icon vẽ tay | Chữ tiếng Việt 100% chính xác, nhất quán, nhanh, miễn phí |
| **Nhược điểm** | Có thể sai dấu tiếng Việt, tốn API call | Không có hình minh họa AI, chỉ dùng emoji |
| **Phù hợp** | Poster quảng cáo, social media có hình vẽ | Menu, danh sách, timeline, cẩm nang text-heavy |

**Quy tắc chọn**: Nếu nội dung chủ yếu là **text tiếng Việt** (menu, danh sách, hướng dẫn) → dùng `--mode html`. Nếu cần **hình minh họa AI** → dùng mode mặc định.

### Lệnh thực thi

```bash
# Từ JSON inline
node skills/infographic-generator/image-generator.js --mode html '<JSON>' output.png

# Từ file JSON
node skills/infographic-generator/image-generator.js --mode html data.json output.png
```

Nếu có `puppeteer`, script tự render PNG. Nếu không có, script lưu file `.html` — gửi đường dẫn HTML cho người dùng.

### Mẫu JSON cho từng template

#### food-guide — Menu / cẩm nang ẩm thực

```json
{
  "template": "food-guide",
  "color": "warm",
  "flag": "🇻🇳",
  "title": "ẨM THỰC",
  "titleAccent": "VIỆT NAM",
  "subtitle": "Khám phá hương vị đặc trưng",
  "categories": ["Miền Bắc", "Miền Trung", "Miền Nam"],
  "items": [
    {"name": "Phở Hà Nội", "emoji": "🍜", "origin": "Hà Nội", "description": "Nước dùng thanh, bánh phở mỏng", "price": "45.000đ"},
    {"name": "Bún Bò Huế", "emoji": "🍲", "origin": "Huế", "description": "Cay nồng, sả, mắm ruốc", "price": "50.000đ"}
  ],
  "footer": "designed by OpenClaw"
}
```

#### list-cards — Danh sách có đánh số

```json
{
  "template": "list-cards",
  "color": "pastel",
  "title": "10 MẸO TIẾT KIỆM",
  "subtitle": "Áp dụng ngay hôm nay",
  "items": [
    {"name": "Lập ngân sách hàng tháng", "emoji": "📊", "description": "Ghi chép thu chi rõ ràng"},
    {"name": "Nấu ăn tại nhà", "emoji": "🏠", "description": "Giảm 50% chi phí ăn uống"}
  ],
  "footer": "© 2026"
}
```

#### grid — Lưới ô vuông

```json
{
  "template": "grid",
  "color": "bold",
  "columns": 3,
  "title": "9 KỸ NĂNG MỀM",
  "subtitle": "Cần thiết cho năm 2026",
  "items": [
    {"name": "Giao tiếp", "emoji": "🗣️", "description": "Truyền đạt ý tưởng hiệu quả"},
    {"name": "Tư duy phản biện", "emoji": "🧠"},
    {"name": "Quản lý thời gian", "emoji": "⏰"}
  ]
}
```

#### timeline — Dòng thời gian

```json
{
  "template": "timeline",
  "color": "cool",
  "title": "LỊCH SỬ VIỆT NAM",
  "subtitle": "Các mốc quan trọng",
  "items": [
    {"name": "Văn Lang", "emoji": "🏛️", "description": "Nhà nước đầu tiên của người Việt"},
    {"name": "Đại Việt", "emoji": "⚔️", "description": "Thời kỳ độc lập tự chủ"}
  ]
}
```

### Palettes có sẵn

| Palette | Phù hợp |
|---|---|
| `warm` | Ẩm thực, du lịch, lifestyle |
| `cool` | Công nghệ, giáo dục, lịch sử |
| `pastel` | Tips, hướng dẫn, sức khỏe |
| `bold` | Social media, trẻ trung, nổi bật |

---

## 📝 7. MẪU PROMPT CHUNG CHO BOT LLM (TÙY CHỈNH THEO YÊU CẦU)

### Công thức Prompt Tiếng Anh (Khuyên Dùng cho API)

```text
An infographic poster with [Tỷ lệ khung hình] and [Loại nền].
Art style is modern illustration style mixed with hand-drawn elements.
At the top, the main title in clean bold [Tên Font tiếng Việt chuẩn] reads: '[TIÊU ĐỀ VIẾT HOA, 3-5 TỪ]' exactly as written, preserving all Vietnamese diacritical marks.
The layout is divided into [Số lượng] cards or sections [Bố cục chia ô từ trên xuống dưới / Bố cục ô lưới / Quy trình cách thức].
The background and accent colors of the cards are [Màu sắc hài hòa tương ứng phù hợp với chủ đề].
Each card contains a clean flat vector illustration representing [Mô tả ngắn gọn hình vẽ minh họa] and a short text label (2-4 words) in bold [Tên Font tiếng Việt chuẩn] reads: '[NHÃN NGẮN]' exactly as written, preserving all Vietnamese diacritical marks.
The text throughout the image must be clean, legible, and easy to read. All Vietnamese text must be rendered with correct diacritical marks.
High-resolution, high quality, professional infographic poster, no spelling mistakes.
```
