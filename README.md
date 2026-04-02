# MASDO OFFICIAL [XI-9] - Vercel All-in-One

<div align="center">

![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-Vercel-black.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**Website Portofolio Premium + Sistem Absensi Digital**

*Hasil Perombakan Total ke Vercel All-in-One Architecture*

[Demo](https://masdo-official.vercel.app) · [Report Bug](https://github.com/masdo/masdo-official/issues) · [Request Feature](https://github.com/masdo/masdo-official/issues)

</div>

---

## 🎯 Spesifikasi Hasil Perombakan

### Architecture Overview

```
┌─────────────────────────────────────────┐
│         Vercel All-in-One              │
├─────────────────────────────────────────┤
│                                         │
│  Frontend (Static SPA)                  │
│  ├─ index.html                          │
│  ├─ style.css (Glassmorphism)           │
│  └─ app.js (Vanilla JS)                 │
│                                         │
│  Backend (Serverless Functions)         │
│  ├─ /api/config.js                      │
│  ├─ /api/login.js                       │
│  ├─ /api/admin-login.js                 │
│  ├─ /api/absensi.js                     │
│  ├─ /api/admin-stats.js                 │
│  ├─ /api/admin-siswa.js                 │
│  ├─ /api/admin-absensi.js               │
│  └─ /api/admin-export.js                │
│                                         │
│  Helpers                                │
│  ├─ /lib/auth.js (JWT + Bcrypt)         │
│  └─ /lib/sheets.js (Google Sheets)      │
│                                         │
│  Database                               │
│  └─ Google Sheets API                   │
│                                         │
└─────────────────────────────────────────┘
```

---

## 📁 File Structure

```
masdo-official/
├── api/                        # Vercel Serverless Functions
│   ├── config.js              # GET /api/config - Public config
│   ├── login.js               # POST /api/login - Siswa login
│   ├── admin-login.js         # POST /api/admin-login - Admin login
│   ├── absensi.js             # GET /api/absensi - Siswa absensi (protected)
│   ├── admin-stats.js         # GET /api/admin-stats - Admin stats (protected)
│   ├── admin-siswa.js         # GET/POST/DELETE /api/admin-siswa (protected)
│   ├── admin-absensi.js       # GET/POST/PUT/DELETE /api/admin-absensi (protected)
│   └── admin-export.js        # GET /api/admin-export - Export CSV (protected)
├── lib/
│   ├── auth.js                # JWT & bcrypt utilities
│   └── sheets.js              # Google Sheets helper functions
├── public/
│   ├── index.html             # Single Page App dengan hamburger menu
│   ├── style.css              # Modern glassmorphism design
│   └── app.js                 # Complete frontend logic
├── config.json                # App configuration
├── package.json               # Dependencies
├── vercel.json                # Vercel configuration
└── README.md                  # This file
```

---

## ✨ Features Checklist

### Frontend Features
- [x] ☰ **Hamburger Menu Navigation** - Fixed position, smooth slide animation
- [x] 🔐 **Login Menu Prominent** - Gradient background, glow effect, larger font
- [x] 💼 **Portofolio Carousel** - Auto-slide, swipe support, keyboard navigation
- [x] 💪 **Skills Display** - Progress bars with animations
- [x] 🌐 **Social Media Cards** - Gradient backgrounds, hover effects
- [x] 👤 **About Section** - Profile info, achievements
- [x] ❓ **FAQ Accordion** - 8+ comprehensive questions, smooth toggle
- [x] 🚪 **Logout Modal** - Red background, kritik/saran form, WhatsApp integration
- [x] 🌙 **Theme Toggle** - Dark/light mode with smooth transitions
- [x] 📊 **Dashboard** - Siswa & Admin dashboard with stats
- [x] 📱 **Fully Responsive** - Mobile, tablet, desktop optimized

### Backend Features
- [x] 🔒 **JWT Authentication** - Token-based auth, 8 hour expiry
- [x] 🔐 **Bcrypt Password Hashing** - Secure password storage
- [x] 📊 **Google Sheets Integration** - Real-time data sync
- [x] 👥 **CRUD Siswa** - Add, view, delete siswa
- [x] ✅ **CRUD Absensi** - Create, read, update, delete absensi
- [x] 📥 **CSV Export** - Download absensi data as CSV
- [x] 📈 **Statistics** - Real-time attendance stats
- [x] 🛡️ **Role-based Access** - Siswa vs Admin permissions

### Design Features
- [x] 🎨 **Glassmorphism Design** - Modern blurred glass effect
- [x] 🌈 **Gradient Accents** - Beautiful color transitions
- [x] ✨ **Smooth Animations** - 60fps transitions
- [x] 🎯 **Accessibility** - ARIA labels, keyboard navigation
- [x] 📐 **Consistent Spacing** - Professional layout
- [x] 🖼️ **Optimized Images** - Fast loading

---

## 🚀 Setup Guide

### 1. Setup Google Cloud Console

#### 1.1 Create Project
1. Buka https://console.cloud.google.com
2. Klik **Select a project** → **New Project**
3. Nama project: `MASDO-Official-Absensi`
4. Klik **Create**

#### 1.2 Enable Google Sheets API
1. Di dashboard project, buka **APIs & Services** → **Library**
2. Search: `Google Sheets API`
3. Klik **Google Sheets API** → **Enable**

#### 1.3 Create Service Account
1. Buka **APIs & Services** → **Credentials**
2. Klik **Create Credentials** → **Service Account**
3. Isi form:
   - **Service account name**: `absensi-service`
   - **Service account ID**: (auto-generated)
   - Klik **Create and Continue**
4. **Grant this service account access to project**:
   - Role: `Editor`
   - Klik **Continue** → **Done**

#### 1.4 Download JSON Key
1. Di halaman **Credentials**, klik service account yang baru dibuat
2. Tab **Keys** → **Add Key** → **Create new key**
3. Key type: **JSON**
4. Klik **Create** → File JSON akan terdownload
5. **SIMPAN FILE INI DENGAN AMAN!**

---

### 2. Setup Google Sheets

#### 2.1 Create Spreadsheet
1. Buka https://sheets.google.com
2. Klik **Blank** untuk membuat sheet baru
3. Rename: `MASDO Official - Absensi XI-9`

#### 2.2 Create Sheet: DATA_SISWA
1. Rename `Sheet1` menjadi `DATA_SISWA`
2. Buat header di row 1:
   ```
   | kode_siswa | nama | password_hash | jenis_kelamin | no_telepon |
   ```
3. Contoh data (row 2):
   ```
   | XI9001 | Ahmad | $2b$10$... | L | 08123456789 |
   ```

#### 2.3 Create Sheet: ABSENSI
1. Klik **+** di bagian bawah untuk sheet baru
2. Rename menjadi `ABSENSI`
3. Buat header di row 1:
   ```
   | tanggal | kode_siswa | nama | status | keterangan |
   ```
4. Contoh data (row 2):
   ```
   | 2025-01-15 | XI9001 | Ahmad | H | - |
   ```

#### 2.4 Share Sheet ke Service Account
1. Klik tombol **Share** di kanan atas
2. Di field **Add people and groups**, paste:
   - Email dari service account (ada di JSON key: `client_email`)
   - Contoh: `absensi-service@masdo-official-absensi.iam.gserviceaccount.com`
3. Role: **Editor**
4. **UNCHECK** "Notify people"
5. Klik **Share**

#### 2.5 Copy Spreadsheet ID
1. Dari URL spreadsheet:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```
2. Copy bagian `[SPREADSHEET_ID]`
3. Contoh: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

---

### 3. Configure config.json

#### 3.1 Update Google Sheets Config
```json
{
  "googleSheets": {
    "spreadsheetId": "PASTE_SPREADSHEET_ID_DISINI",
    "serviceAccount": {
      // PASTE SELURUH ISI JSON KEY YANG DIDOWNLOAD DISINI
      "type": "service_account",
      "project_id": "masdo-official-absensi",
      "private_key_id": "...",
      "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
      "client_email": "absensi-service@masdo-official-absensi.iam.gserviceaccount.com",
      // ... dst
    },
    "sheets": {
      "dataSiswa": "DATA_SISWA",
      "absensi": "ABSENSI"
    }
  }
}
```

#### 3.2 Generate JWT Secret
```bash
# Generate strong JWT secret (64+ characters)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Paste hasil ke:
```json
{
  "security": {
    "jwtSecret": "PASTE_HASIL_GENERATE_DISINI"
  }
}
```

#### 3.3 Hash Admin Password
```bash
# Install bcrypt
npm install bcrypt

# Generate hash
node -e "require('bcrypt').hash('PASSWORD_ADMIN', 10, (e,h) => console.log(h))"
```

Paste hasil ke:
```json
{
  "security": {
    "adminCredentials": {
      "username": "admin",
      "passwordHash": "PASTE_HASIL_HASH_DISINI"
    }
  }
}
```

#### 3.4 Update Profil & Projects
Edit sesuai kebutuhan di `config.json`:
- `profil`: nama, kelas, sekolah, skills, achievements
- `sosmed`: URL social media
- `projects`: portfolio projects

---

### 4. Deploy to Vercel

#### 4.1 Install Vercel CLI
```bash
npm install -g vercel
```

#### 4.2 Login to Vercel
```bash
vercel login
```

#### 4.3 Deploy
```bash
# Development deployment
vercel

# Production deployment
vercel --prod
```

#### 4.4 Setup Environment (Optional)
Jika ingin pisahkan config dari code:
1. Buka Vercel Dashboard → Project → Settings → Environment Variables
2. Tambahkan variables dari `config.json` jika perlu

---

## 🧪 Testing Checklist

### Manual Testing

#### ✅ Hamburger Menu
- [ ] Icon ☰ fixed di pojok kiri atas
- [ ] Menu slide smooth dari kiri
- [ ] Backdrop blur overlay muncul
- [ ] All menu items navigable
- [ ] Active page highlighted
- [ ] Close on click outside
- [ ] Close on menu item click

#### ✅ Login Menu
- [ ] Visually prominent (gradient, larger font)
- [ ] Glow effect visible
- [ ] Login form works (siswa & admin)
- [ ] After login, menu berubah jadi "Dashboard"

#### ✅ Portofolio Carousel
- [ ] Slides work (prev/next buttons)
- [ ] Dots navigation works
- [ ] Auto-slide every 5 seconds
- [ ] Pause on hover
- [ ] Smooth transitions
- [ ] Swipe support on mobile
- [ ] Keyboard navigation (arrow keys)

#### ✅ FAQ
- [ ] Minimal 8 pertanyaan
- [ ] Accordion toggle works
- [ ] Icon rotate on open
- [ ] Auto-close others when one opened
- [ ] Smooth max-height animation

#### ✅ Logout Modal
- [ ] Red background
- [ ] Textarea untuk kritik/saran
- [ ] Character counter works
- [ ] WhatsApp integration (if kritik ≥ 10 chars)
- [ ] Logout works
- [ ] Can skip kritik/saran

#### ✅ Theme Toggle
- [ ] Icon change (🌙/☀️)
- [ ] Smooth color transitions
- [ ] Persistent (localStorage)
- [ ] All components respond to theme

#### ✅ API Functions
- [ ] `/api/config` returns public config
- [ ] `/api/login` siswa works
- [ ] `/api/admin-login` admin works
- [ ] `/api/absensi` returns siswa data (with token)
- [ ] `/api/admin-stats` returns stats (admin only)
- [ ] `/api/admin-siswa` CRUD works
- [ ] `/api/admin-absensi` CRUD works
- [ ] `/api/admin-export` CSV download works

#### ✅ Responsive
- [ ] Perfect di mobile (320px - 768px)
- [ ] Perfect di tablet (768px - 1024px)
- [ ] Perfect di desktop (> 1024px)
- [ ] No horizontal scroll
- [ ] Touch-friendly pada mobile

---

## ⚡ Performance Targets

### Lighthouse Scores (Target)
- **Performance**: > 90
- **Accessibility**: > 95
- **Best Practices**: > 95
- **SEO**: > 90

### Load Times
- **First Load**: < 3 seconds
- **Serverless Cold Start**: < 2 seconds
- **Subsequent Navigation**: < 500ms

### Optimizations Applied
- ✅ Static assets cached by Vercel CDN
- ✅ Serverless functions auto-scaled
- ✅ CSS minification on production
- ✅ Lazy loading for images
- ✅ Efficient API calls (minimal roundtrips)
- ✅ Local storage for auth persistence

---

## 🌐 Browser Support

| Browser | Minimum Version |
|---------|----------------|
| Chrome  | Latest         |
| Firefox | Latest         |
| Safari  | 14+            |
| Edge    | Latest         |
| Mobile Safari | iOS 14+ |
| Chrome Mobile | Latest  |

---

## 🐛 Troubleshooting

### Issue: "Google Sheets API error"

**Cause**: Service account tidak punya akses ke spreadsheet

**Solution**:
1. Pastikan spreadsheet sudah di-share ke `client_email` dari service account
2. Role harus `Editor`
3. Pastikan Sheets API sudah enabled di Google Cloud Console

---

### Issue: "Token tidak valid atau sudah kadaluarsa"

**Cause**: JWT token expired (8 jam)

**Solution**:
1. Logout dan login ulang
2. Token akan di-refresh

---

### Issue: "Serverless function timeout"

**Cause**: Google Sheets API slow response

**Solution**:
1. Check Google Sheets API quota
2. Reduce data size jika terlalu besar
3. Consider pagination untuk data besar

---

### Issue: "Cannot read property of undefined"

**Cause**: config.json tidak lengkap

**Solution**:
1. Pastikan semua field di `config.json` terisi
2. Especially: `googleSheets.spreadsheetId`, `googleSheets.serviceAccount`, `security.jwtSecret`

---

## 🔒 Security Best Practices

1. **JWT Secret**: Gunakan random string minimal 64 karakter
2. **Admin Password**: Hash dengan bcrypt, jangan plain text
3. **Service Account**: Jangan expose JSON key di public repository
4. **HTTPS Only**: Vercel otomatis enforce HTTPS
5. **Rate Limiting**: Vercel otomatis handle rate limiting
6. **CORS**: Same-origin, tidak perlu CORS config

---

## 📦 Dependencies

### Production
```json
{
  "jsonwebtoken": "^9.0.2",  // JWT authentication
  "bcrypt": "^5.1.1",         // Password hashing
  "googleapis": "^128.0.0"    // Google Sheets API
}
```

### Development
```json
{
  "vercel": "^33.0.0"  // Vercel CLI for local testing
}
```

**Note**: Tidak perlu `express`, `cors`, `helmet`, `morgan`, `rate-limit` karena sudah di-handle oleh Vercel platform.

---

## 🚀 Local Development

```bash
# Install dependencies
npm install

# Run local development server
vercel dev

# Open browser
http://localhost:3000
```

**Vercel Dev** akan simulate production environment locally, termasuk serverless functions.

---

## 📊 API Endpoints Reference

### Public Endpoints

#### GET /api/config
Returns public configuration (profil, sosmed, projects)

**Response**:
```json
{
  "success": true,
  "data": {
    "app": {...},
    "profil": {...},
    "sosmed": [...],
    "projects": [...]
  }
}
```

---

### Authentication Endpoints

#### POST /api/login
Siswa login

**Body**:
```json
{
  "kode_siswa": "XI9001",
  "password": "password123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "kode_siswa": "XI9001",
      "nama": "Ahmad",
      "role": "siswa"
    }
  }
}
```

---

#### POST /api/admin-login
Admin login

**Body**:
```json
{
  "username": "admin",
  "password": "adminpass"
}
```

---

### Protected Endpoints (Require JWT Token)

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

#### GET /api/absensi
Get siswa absensi data (siswa only)

**Query Params** (optional):
- `tanggalMulai`: YYYY-MM-DD
- `tanggalSelesai`: YYYY-MM-DD
- `status`: H|I|S|A

---

#### GET /api/admin-stats
Get admin dashboard statistics (admin only)

---

#### GET /api/admin-siswa
Get all siswa (admin only)

#### POST /api/admin-siswa
Add new siswa (admin only)

**Body**:
```json
{
  "kode_siswa": "XI9002",
  "nama": "Budi",
  "password": "password123",
  "jenis_kelamin": "L",
  "no_telepon": "08123456789"
}
```

#### DELETE /api/admin-siswa
Delete siswa (admin only)

**Body**:
```json
{
  "kode_siswa": "XI9002"
}
```

---

#### GET /api/admin-absensi
Get all absensi data (admin only)

#### POST /api/admin-absensi
Save batch absensi (admin only)

**Body**:
```json
{
  "tanggal": "2025-01-20",
  "dataAbsensi": [
    {
      "kode_siswa": "XI9001",
      "nama": "Ahmad",
      "status": "H",
      "keterangan": "-"
    }
  ]
}
```

#### PUT /api/admin-absensi
Update absensi (admin only)

#### DELETE /api/admin-absensi
Delete absensi (admin only)

---

#### GET /api/admin-export
Export CSV (admin only)

**Query Params**:
- `format`: csv | json (default: json)
- `tanggalMulai`: YYYY-MM-DD (optional)
- `tanggalSelesai`: YYYY-MM-DD (optional)

---

## 📝 License

MIT License - Copyright (c) 2025 Masdo - XI-9

---

## 🙏 Credits

- **Developer**: Masdo (XI-9)
- **Design**: Glassmorphism UI Pattern
- **Platform**: Vercel Serverless
- **Database**: Google Sheets API
- **Auth**: JWT + Bcrypt

---

## 📧 Support

Jika ada pertanyaan atau issue:
1. Buka GitHub Issues
2. Atau hubungi via WhatsApp (lihat config.json → sosmed)

---

<div align="center">

**Made with ❤️ by Masdo - XI-9**

*Sistem Absensi Digital Modern untuk Pendidikan*

</div>
