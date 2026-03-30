# Thinh Minh Eco-Industrial Park

## Project Structure

```
ThinhMinh/
├── index.html              # Landing page (HTML thuan)
├── layout.html             # Interactive map (React via CDN)
├── layout-vector.svg       # SVG ban do
├── images/                 # Hinh anh
├── server/
│   ├── package.json
│   ├── server.js           # API server Node.js
│   ├── lots-data.json      # Du lieu lots (chinh sua tai day)
│   └── google-credentials.json  # (tu tao) Google Service Account key
```

## Cach chay

```bash
cd server
npm install
npm start
```

Mo trinh duyet tai:
- **Trang chu:** http://localhost:3000/index.html
- **Ban do:** http://localhost:3000/layout.html
- **API Lots:** http://localhost:3000/api/lots

## API

### GET /api/lots

Tra ve danh sach tat ca lots voi thong tin chi tiet.

**Response:**
```json
[
  {
    "svgGroupId": "POLYLINE-21",
    "lotId": "A3-06",
    "name": "Lot A3-06",
    "status": "Available",
    "zoning": "Medium Scale Enterprise",
    "zoneSizeRange": "2-5 ha",
    "area": "2.9",
    "coverage": "60%",
    "price": 116,
    "rent": "3,364,000",
    "use": "Eco-Tech & Light Manufacturing",
    "height": "25m (approx. 5 floors)"
  }
]
```

### POST /api/request-info

Gui yeu cau thong tin ve lot. Luu vao Google Sheets (hoac file local neu chua cau hinh).

**Request body:**
```json
{
  "lotId": "A3-06",
  "lotName": "Lot A3-06",
  "fullName": "Nguyen Van A",
  "company": "ABC Corp",
  "email": "a@abc.com",
  "phone": "0123456789",
  "requirements": "Can thong tin ve gia thue dai han"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Inquiry submitted successfully"
}
```

## Cau hinh Google Sheets

1. Vao [Google Cloud Console](https://console.cloud.google.com/)
2. Tao project moi, bat **Google Sheets API**
3. Vao **IAM & Admin > Service Accounts** > tao service account
4. Tao key JSON > tai ve > luu thanh `server/google-credentials.json`
5. Tao Google Sheet moi > **Share** voi email cua service account (quyen Editor)
6. Copy **Sheet ID** tu URL:
   ```
   https://docs.google.com/spreadsheets/d/{SHEET_ID_O_DAY}/edit
   ```
7. Set vao `server/server.js` dong 47 hoac dung bien moi truong:
   ```bash
   GOOGLE_SHEET_ID=your_sheet_id npm start
   ```

Khi chua cau hinh Google Sheets, API se tu dong luu vao `server/inquiries.json`.

## Du lieu lots

Chinh sua file `server/lots-data.json` de cap nhat thong tin lots.

Moi lot duoc map voi SVG thong qua truong `svgGroupId` tuong ung voi `id` cua the `<g>` trong file `layout-vector.svg`.

| svgGroupId | Loai | CSS class | Mau |
|---|---|---|---|
| POLYLINE, POLYLINE-7 ~ 42, 45-46, 48-49, 54-69, 71-80, 102-108 | Medium (2-5 ha) | cls-6 | #af02f8 |
| POLYLINE-43 | Very Large (>10 ha) | cls-3 | #4805d5 |
| POLYLINE-81 ~ 84, 105, 107 | Large (5-10 ha) | cls-2 | #5d2969 |
| POLYLINE-44, 47, 50-52, 85-100 | Small (<2 ha) | cls-5 | #df02f6 |

## Tech stack

- **Frontend:** HTML, Tailwind CSS (CDN), React 18 (CDN via import maps), Lucide icons
- **Backend:** Node.js, Express, googleapis
- **Data:** JSON file, Google Sheets
