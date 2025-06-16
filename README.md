# Budget Dashboard Management

Aplikasi web untuk manajemen dan monitoring anggaran keuangan dengan fitur-fitur lengkap untuk melacak pemasukan, pengeluaran, dan alokasi budget.

## Fitur

- 🔐 Sistem autentikasi dengan multi-user (admin & user)
- 💰 Manajemen pemasukan dengan kategorisasi
- 📊 Alokasi budget dengan monitoring penggunaan
- 💸 Pencatatan pengeluaran terkait budget
- 📈 Dashboard interaktif dengan grafik perbandingan
- 📋 Riwayat transaksi dengan fitur filter
- 📑 Export laporan ke PDF

## Teknologi

- HTML5, CSS3, dan JavaScript murni (Vanilla JS)
- Chart.js untuk visualisasi data
- jsPDF untuk generate laporan PDF
- LocalStorage untuk penyimpanan data
- Font Awesome untuk ikon

## Cara Penggunaan

1. Clone repository ini
2. Buka `index.html` di browser
3. Login dengan kredensial default:
   - Admin: username `admin` / password `admin123`
   - User: username `user` / password `user123`

## Struktur Proyek

```
├── assets/
│   ├── css/
│   │   ├── login.css    # Styling halaman login
│   │   └── main.css     # Styling utama aplikasi
│   ├── icon/
│   │   ├── icon.png     # Favicon
│   │   └── logo.png     # Logo aplikasi
│   └── js/
│       ├── auth.js      # Sistem autentikasi
│       └── main.js      # Logika utama aplikasi
├── pages/
│   └── login_page.html  # Halaman login
└── index.html           # Halaman utama aplikasi
```

## Lisensi

Proyek ini dilisensikan di bawah Lisensi MIT - lihat file [LICENSE](LICENSE) untuk detail.

## Pengembang

Dikembangkan oleh Steven Morison

---

&copy; 2025 Budget Dashboard Management. Dibuat dengan 💙