# TrustFound - Campus Lost & Found System Frontend

Frontend application untuk sistem Lost & Found kampus modern dengan fitur Blind Listing dan Smart Verification.

## Tech Stack

- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Routing:** React Router DOM v6
- **HTTP Client:** Axios
- **UI Components:** Headless UI

## Features

### Public Pages
- **Home** - Browse barang temuan dengan fitur search dan filter
- **Login** - Autentikasi user
- **Register** - Registrasi akun mahasiswa baru

### User Pages (Protected)
- **Upload Item** - Lapor barang temuan dengan upload foto
- **Claim Item** - Ajukan klaim untuk barang yang hilang
- **Profile** - Lihat riwayat klaim dengan status (Pending/Verified/Rejected)

### Admin Pages (Admin/Satpam Only)
- **Dashboard** - Kelola sistem dengan 3 tabs:
  - **Manage Items** - Blur/Unblur gambar barang sensitif
  - **Manage Claims** - Approve/Reject klaim masuk
  - **Activity Logs** - Monitor aktivitas sistem

## Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Backend API sudah dikonfigurasi di `src/services/api.js`:
- Base URL: `https://api.thrqrhmn.my.id/api`
- Image URL: `https://api.thrqrhmn.my.id`

Token JWT disimpan otomatis di localStorage dengan key `token`.

### 3. Run Development Server

```bash
npm run dev
```

### 4. Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── layout/
│   │   └── Navbar.jsx           # Navigasi utama dengan role-based menu
│   └── ProtectedRoute.jsx       # Guard untuk route yang butuh auth
│
├── pages/
│   ├── public/
│   │   └── Home.jsx             # Landing page & browse items
│   ├── auth/
│   │   ├── Login.jsx            # Login page
│   │   └── Register.jsx         # Registration page
│   ├── user/
│   │   ├── UploadItem.jsx       # Form lapor barang temuan
│   │   ├── ClaimItem.jsx        # Form klaim barang
│   │   └── Profile.jsx          # User profile & claim history
│   └── admin/
│       └── Dashboard.jsx        # Admin dashboard (manage items, claims, logs)
│
├── services/
│   └── api.js                   # Axios instance dengan JWT interceptor
│
├── App.jsx                      # Router configuration
├── main.tsx                     # Entry point
└── index.css                    # Tailwind CSS imports
```

## API Integration

### Authentication
- Token disimpan di localStorage setelah login
- Setiap request otomatis menyertakan `Authorization: Bearer <token>`
- Auto-redirect ke login jika token expired (401)

### Image Upload
- Endpoint: `POST /items`
- Content-Type: `multipart/form-data`
- Backend otomatis blur gambar sensitif

### Protected Routes
- Menggunakan `<ProtectedRoute>` component
- Redirect ke `/auth/login` jika belum login
- Admin routes check role: `admin` atau `satpam`

## User Roles

1. **Mahasiswa (User)** - Dapat:
   - Browse barang temuan
   - Lapor barang temuan
   - Klaim barang
   - Lihat riwayat klaim

2. **Admin/Satpam** - Dapat:
   - Semua fitur mahasiswa +
   - Blur/Unblur gambar barang
   - Approve/Reject klaim
   - Lihat activity logs

## Key Features

### Blind Listing
- Gambar barang sensitif (dompet, HP, dokumen) otomatis diblur
- Admin dapat unblur untuk verifikasi
- Melindungi privasi pemilik barang

### Smart Verification
- User harus menjelaskan ciri-ciri spesifik barang
- Barang sensitif membutuhkan deskripsi minimal 10 karakter
- Admin review sebelum approve

### Responsive Design
- Mobile-first approach
- Adaptive layout untuk tablet & desktop
- Touch-friendly interface

## Development Notes

- Gunakan React hooks untuk state management
- Error handling dengan alert notification
- Loading states dengan skeleton/spinner
- Form validation client-side & server-side
- Optimistic UI updates setelah actions

## Backend API Documentation

Backend API tersedia di: `https://api.thrqrhmn.my.id/api`

Dokumentasi lengkap tersedia di backend README.

## License

© 2024 TrustFound Team
