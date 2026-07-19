# OBS

Ogrenci Bilgi Sistemi — Fakulte, bolum, ders, ogrenci, akademisyen ve kayit islemlerini tek bir platform uzerinden yonetmek icin gelistirilmis kapsamli bir web uygulamasi.

## Ozellikler

- **Rol Tabanli Erisim:** Admin, Akademisyen ve Ogrenci rolleri icin ayri panel ve yetkilendirme
- **JWT Kimlik Dogrulama:** Access + Refresh Token rotation ile guvenli oturum yonetimi
- **Akademik Yapi Yonetimi:** Fakulte > Bolum > Ders > Ders Subesi hiyerarsisi
- **Ders Secme & Kayit:** Kontenjan, AKTS limiti ve program cakismasi kontrolleri
- **Not & Devamsizlik:** Akademisyen not girisi, kesinlestirme ve devamsizlik takibi
- **Duyuru & Takvim:** Rol bazli duyuru sistemi ve akademik takvim
- **PDF Cikisi:** Transkript, program ve sinav programi PDF exportu
- **Dark Mode:** Tum uygulama genelinde karanlik/aydinlik tema destegi

## Teknolojiler

### Backend
- Node.js + Express 4
- PostgreSQL (Prisma ORM 7)
- JWT (Access + Refresh Token Rotation)
- Swagger/OpenAPI 3.0
- express-validator, bcryptjs, helmet, cors

### Frontend
- React 19 + Vite 8
- Tailwind CSS 4
- TanStack React Query 5
- React Router DOM 7
- React Hook Form + Zod
- Axios, Lucide React, Day.js

### Onkosullar

- Node.js 18+
- PostgreSQL 14+
- npm 9+

### Calistirma

```bash
# Backend ve Frontend ayni anda
npm run dev

# Veya ayri ayri
npm run dev:backend
npm run dev:frontend
```

Uygulama varsayilan olarak sunu adresinde calisir:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api/v1`
- Swagger: `http://localhost:5000/api-docs`

## Proje Yapisi

```
obs/
├── backend/
│   ├── prisma/            # Veritabani semasi, migration, seed
│   ├── src/
│   │   ├── config/        # Prisma client
│   │   ├── controllers/   # Route handler'lari
│   │   ├── middlewares/    # Auth, role, rate-limit, hata
│   │   ├── repositories/  # Veritabani sorgulari
│   │   ├── routes/        # API route tanimlari
│   │   ├── services/      # Is mantigi katmani
│   │   ├── swagger/       # OpenAPI konfigurasyonu
│   │   ├── utils/         # Yardimci fonksiyonlar
│   │   └── validators/    # Giris dogrulama kurallari
│   └── server.js          # Uygulama giris noktasi
├── frontend/
│   └── src/
│       ├── api/           # Axios servis fonksiyonlari
│       ├── components/    # Bilesenler (ui, layout, feature)
│       ├── context/       # Auth ve tema saglayicilari
│       ├── hooks/         # Ozel hook'lar
│       ├── layouts/       # Sayfa duzenleri
│       ├── pages/         # Tum sayfa bileşenleri
│       ├── routes/        # Yonlendirme tanimlari
│       └── utils/         # Yardimci fonksiyonlar
└── task/                  # Planlama dokumanlari
```

## Varsayilan Giris Bilgileri

Seed verisi ile olusturulan hesaplar:

| Rol | E-posta | Sifre |
|-----|---------|-------|
| Admin | admin@obs.edu.tr | Admin123 |
| Akademisyen | akademisyen1@obs.edu.tr | Akademisyen123 |
| Ogrenci | ogrenci1@obs.edu.tr | Ogrenci123 |

## Gelistirme Asamalari

1. **Faz 1** — Proje iskeleti, veritabani semasi, auth, rol altyapisi
2. **Faz 2** — Akademik yapi: fakulte, bolum, ders, ders subesi CRUD
3. **Faz 3** — Ogrenci islemleri: ders secme, kayit, danisman onayi
4. **Faz 4** — Not ve devamsizlik yonetimi
5. **Faz 5** — Takvim, program ve duyuru sistemi
6. **Faz 6** — Admin paneli: kullanici/rol yonetimi, log, dosya yonetimi
7. **Faz 7** — Cilalama: dark mode, animasyon, PDF export, guvenlik taramasi