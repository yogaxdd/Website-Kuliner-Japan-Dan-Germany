# 食 × Essen — Galeri Kuliner Jepang × Jerman

Galeri visual dua dunia kuliner: **Jepang** dan **Jerman**, dirayakan dalam satu halaman dengan tema yang bisa diganti — wabi-sabi editorial vs. Neo-Bauhaus bold.

🌐 **Konsep:** Toggle JP/DE bukan sekadar ganti warna, tapi ganti seluruh kepribadian halaman — bahasa, hidangan, glosarium, tradisi meja, foto hero, sampai font display.

## Fitur

- **44 hidangan** — 24 Jepang + 20 Jerman, masing-masing dengan kanji/uppercase, romaji, kategori, asal, deskripsi, dan foto resmi dari Wikimedia Commons
- **Dual-theme** dengan animasi wipe overlay saat switch
- **Bilingual content** — story, tradisi, glosarium berubah lengkap per tema
- **Glosarium istilah dapur** (Umami, Dashi, Brotzeit, Mahlzeit, dst.)
- **Tradisi meja** — 4 aturan per negara
- **Responsive** mobile-first dengan hamburger drawer
- **Animasi entrance + scroll reveal** dengan IntersectionObserver
- `prefers-reduced-motion` direspek di seluruh komponen

## Tech Stack

```
HTML5 + CSS3 + Vanilla JavaScript (ES6+)
Tidak ada framework. Tidak ada build tool.
```

## Struktur Folder

```
.
├── index.html              # Markup semantik lengkap
├── css/
│   ├── base.css            # Reset, CSS variables (JP/DE), typography
│   └── components.css      # Nav, hero, story, menu, tradisi, glosarium, footer
└── js/
    └── main.js             # Theme engine, render, scroll reveal, drawer
```

## Menjalankan Lokal

Cukup buka `index.html` di browser, atau pakai live server:

```bash
# Pilih salah satu:
python -m http.server 5500
# atau
npx serve .
```

Lalu buka `http://localhost:5500`.

## Sumber Gambar

Semua foto diambil dari [Wikimedia Commons](https://commons.wikimedia.org/) — lisensi Creative Commons (CC-BY-SA), bebas dipakai dengan atribusi.

## Lisensi

MIT — bebas dipakai dan dimodifikasi.

---

*Made with ♥ for Dinda*
