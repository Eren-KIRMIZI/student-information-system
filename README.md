# Bozok Universitesi OBS — Ogrenci Bilgi Sistemi

Fakulte, bolum, ders, ogrenci, akademisyen, kayit, not, devamsizlik, duyuru ve takvim
islemlerini tek bir platform uzerinden yonetmek icin gelistirilmis kapsamli bir web
uygulamasi. Monorepo mimarisi ile backend ve frontend tek bir depo icinde barindirilir.

---

## Ozellikler

### Rol Tabanli Erisim (RBAC)

Uc ayri rol tanimlidir. Her rol icin ayri panel, navigasyon menuyu ve API yetkisi
bulunur:

| Rol | Erisilebilir Paneller |
|-----|----------------------|
| **ADMIN** | Tum panel sayfalari: kullanici, rol, fakulte, bolum, ogrenci, akademisyen, ders, ders subesi, danisman atama, duyuru, akademik takvim, log |
| **ACADEMICIAN** | Dashboard, verdigi dersler, danismanligi altindaki ogrenciler, haftalik program, duyuru, akademik takvim |
| **STUDENT** | Dashboard, ders programi, sinav programi, notlar, transkript, ders katalogu, ders secme, devamsizlik, duyuru, akademik takvim |

### Kimlik Dogrulama ve Yetkilendirme

- JWT access + refresh token rotation
- HttpOnly cookie tabanli refresh token depolama
- Sifre hashleme: bcrypt (round: 12)
- Roller uzerinden route korumasi (authorize middleware)
- Giris denemesi rate limiting (ip bazli)

### Akademik Yapi Yonetimi

Fakulte > Bolum > Ders > Ders Subesi hiyerarsisi uzerinde tam CRUD islemi:

- Fakulte: olustur, listele, guncelle, sil
- Bolum: fakulteye bagli CRUD
- Ders: bolume bagli, AKTS ve kredi bilgisiyle CRUD
- Ders Subesi: akademik yil + donem + ogretim uyesi bazli sube olusturma, arsivleme

### Ogrenci Kayit Sistemi

- Ogrenciler ders katalogundan sectikleri dersleri kayit icin talep eder
- Kontenjan kontrolu: sube doluysa kayit reddedilir
- AKTS limiti kontrolu: ogrencinin alabilecegi maksimum AKTS sinirli
- Program cakismasi kontrolu: ayni saatte baska ders varsa kayit engellenir
- Danisman onayi: kayit talepleri akademisyen veya admin tarafindan onaylanir/reddedilir
- Kayit durum akisi: PENDING > APPROVED/REJECTED > ACTIVE > COMPLETED/DROPPED

### Not ve Devamsizlik

- Akademisyenler ara sinav, final ve butunleme notu girer
- Harf notu hesaplama: standart 4'luk not olcegi (AA: 4.00 - FF: 0.00)
- Ders bazli GPA hesaplama
- Transkript olusturma: donem bazli not listesi ve donemlik/yiil GPA
- PDF transkript cikisi: pdfkit ile uretilir, Arial font ile Turkce karakter destegi
- Devamsizlik kaydi: ogretim uyesi tarafindan gunluk yoklama
- Devamsizlik ozeti: ogrenci tarafindan kendi devamsizlik yuzdesi goruntulenir

### Duyuru ve Takvim

- Admin tarafindan duyuru olusturma (baslik, icerik, kategori, hedef rol)
- Rol bazli filtreleme: duyurular yalnizca ilgili role gosterilir
- Kategoriler: genel, akademik, sinav, etkinlik
- Akademik takvim: kayit donemi, sinav haftasi, tatil, donem baslangic/bitis gibi
  tarihlerin yonetilmesi

### Dosya Yukleme

- Profil fotograf yukleme ve guncelleme
- Ders materyali yukleme (PDF, DOCX, PPTX, gorseller)
- Maksimum dosya boyutu: 10 MB
- Desteklenen formatlar: JPEG, PNG, WebP, PDF, DOCX, PPTX
- Fiziksel dosya temizleme: silinen kayitlarla birlikte dosya diskten kaldirilir

### Sistem Yonetimi

- Kullanici listeleme, olusturma, guncelleme, aktif/pasif yapma
- Rol yonetimi: rollerin aciklamalarini guncelleme
- Sistem loglari: kullanici islemlerinin kaydi (IP, zaman damgasi, meta veri)
- Dashboard istatistikleri: rol bazli ozet bilgiler

### Arayuz

- Tum uygulama genelinde dark mode (acik/karanlik tema)
- Responsive tasarim: mobil, tablet, masaustu uyumlu
- Skeleton yukleme animasyonlari
- Toast bildirim sistemi (basari/hata)
- Modal dialoglar
- Tab navigasyonu
- Filtreleme ve arama
- Sayfalama (pagination)

---

## Teknolojiler

### Backend

| Paket | Surum | Amac |
|-------|-------|------|
| Node.js | 18+ | Calistirma ortami |
| Express | 4.21 | HTTP framework |
| Prisma | 7.8 | ORM + veritabani migration |
| PostgreSQL | 14+ | Veritabani |
| jsonwebtoken | 9.0 | JWT uretimi ve dogrulama |
| bcryptjs | 3.0 | Sifre hashleme |
| express-validator | 7.2 | Giris dogrulama |
| helmet | 8.1 | HTTP header guvenligi |
| cors | 2.8 | Cross-origin erisim |
| morgan | 1.10 | HTTP loglama |
| multer | 2.0 | Dosya yukleme |
| pdfkit | 0.19 | PDF uretimi |
| swagger-jsdoc | 6.2 | JSDoc to OpenAPI donusumu |
| swagger-ui-express | 5.0 | Swagger UI sunumu |
| express-rate-limit | 7.5 | Rate limiting |
| cookie-parser | 1.4 | Cookie parse |

### Frontend

| Paket | Surum | Amac |
|-------|-------|------|
| React | 19.2 | UI framework |
| Vite | 8.1 | Build araci ve dev server |
| Tailwind CSS | 4.3 | Utility-first CSS |
| TanStack React Query | 5.80 | Sunucu durumu ve onbellek yonetimi |
| React Router DOM | 7.6 | Sayfalama ve yol yonetimi |
| React Hook Form | 7.57 | Form yonetimi |
| Zod | 3.25 | Schema dogrulama |
| Axios | 1.9 | HTTP istemcisi |
| Lucide React | 0.511 | Icon kutuphanesi |
| Day.js | 1.11 | Tarih islemleri |
| react-hot-toast | 2.5 | Bildirim sistemi |

### Araclari

| Arac | Amac |
|------|------|
| concurrently | Backend ve frontend ayni anda calistirma |
| Prisma Studio | Veritabani gorsellestirme |

---

## Onkosullar

- Node.js 18 ve ustu
- npm 9 ve ustu
- PostgreSQL 14 ve ustu
- Git (opsiyonel, versiyon kontrolu icin)

---

## Kurulum

### 1. Depoyu Klonla

```bash
git clone <repo-url>
cd student-information-system
```

### 2. Bagimliliklari Yukle

```bash
npm run install:all
```

Bu komut `backend/` ve `frontend/` dizinlerindeki `node_modules` klasorlerini olusturur.

### 3. Veritabani Ayarlari

`backend/.env` dosyasini olustur ve asagidaki degiskenleri tanimla:

```env
DATABASE_URL="postgresql://kullanici:sifre@localhost:5432/obs_db?schema=public"
JWT_ACCESS_SECRET="guvenli-access-token-gizli-anahtari"
JWT_REFRESH_SECRET="guvenli-refresh-token-gizli-anahtari"
JWT_ACCESS_EXPIRES="15m"
JWT_REFRESH_EXPIRES="7d"
CORS_ORIGIN="http://localhost:5173"
PORT=5000
```

### 4. Veritabani Olusturma ve Migration

```bash
cd backend
npx prisma db push
# veya migration ile:
# npx prisma migrate dev --name init
```

### 5. Seed Verisi Yükleme

```bash
npx prisma db seed
```

Bu islem varsayilan admin, akademisyen ve ogrenci hesaplarini olusturur.

### 6. Prisma Client Uretimi

```bash
npx prisma generate
```

---

## Calistirma

Tum proje tek komutla baslatilabilir:

```bash
npm run dev
```

Bu komut `concurrently` ile backend ve frontend ayni anda calisir.

Ayri ayri calistirmak icin:

```bash
# Backend (port 5000)
npm run dev:backend

# Frontend (port 5173)
npm run dev:frontend
```

### Erisim Adresleri

| Servis | Adres |
|--------|-------|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000/api/v1 |
| Swagger UI | http://localhost:5000/api-docs |

---

## Varsayilan Giris Bilgileri

Seed verisi ile olusturulan hesaplar:

| Rol | E-posta | Sifre |
|-----|---------|-------|
| Admin | admin@obs.edu.tr | Admin123 |
| Akademisyen | akademisyen1@obs.edu.tr | Akademisyen123 |
| Ogrenci | ogrenci1@obs.edu.tr | Ogrenci123 |

---

## Proje Yapisi

```
student-information-system/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Veritabani semasi (26 model, 13 enum)
│   │   ├── seed.js                # Varsayilan veri seti
│   │   └── migrations/            # Veritabani migration dosyalari
│   ├── uploads/                   # Yuklenen dosyalar (disk)
│   ├── src/
│   │   ├── config/
│   │   │   └── prisma.js          # Prisma client ornegi
│   │   ├── controllers/           # 20 controller dosyasi
│   │   │   ├── auth.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── faculty.controller.js
│   │   │   ├── department.controller.js
│   │   │   ├── course.controller.js
│   │   │   ├── courseSection.controller.js
│   │   │   ├── student.controller.js
│   │   │   ├── lecturer.controller.js
│   │   │   ├── enrollment.controller.js
│   │   │   ├── grade.controller.js
│   │   │   ├── advisorAssignment.controller.js
│   │   │   ├── attendance.controller.js
│   │   │   ├── weeklySchedule.controller.js
│   │   │   ├── examSchedule.controller.js
│   │   │   ├── announcement.controller.js
│   │   │   ├── academicCalendar.controller.js
│   │   │   ├── dashboard.controller.js
│   │   │   ├── role.controller.js
│   │   │   ├── upload.controller.js
│   │   │   └── log.controller.js
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js       # JWT dogrulama
│   │   │   ├── role.middleware.js       # Rol bazli yetkilendirme
│   │   │   ├── validate.middleware.js   # express-validator sonuc
│   │   │   ├── rateLimit.middleware.js   # Rate limiting
│   │   │   └── error.middleware.js      # Merkezi hata yakalama
│   │   ├── repositories/          # 16 repository dosyasi
│   │   │   ├── academic.repository.js
│   │   │   ├── academicCalendar.repository.js
│   │   │   ├── advisorAssignment.repository.js
│   │   │   ├── announcement.repository.js
│   │   │   ├── attendance.repository.js
│   │   │   ├── dashboard.repository.js
│   │   │   ├── enrollment.repository.js
│   │   │   ├── examSchedule.repository.js
│   │   │   ├── grade.repository.js
│   │   │   ├── log.repository.js
│   │   │   ├── people.repository.js
│   │   │   ├── refreshToken.repository.js
│   │   │   ├── role.repository.js
│   │   │   ├── upload.repository.js
│   │   │   ├── user.repository.js
│   │   │   └── weeklySchedule.repository.js
│   │   ├── routes/               # 20 route dosyasi (swagger annotasyonlu)
│   │   ├── services/             # 16 service dosyasi
│   │   ├── swagger/
│   │   │   └── swagger.config.js  # OpenAPI 3.0 konfigurasyonu
│   │   ├── utils/
│   │   │   ├── appError.util.js   # Ozel hata sinifi
│   │   │   ├── gradeScale.js      # Harf notu ve GPA hesaplama
│   │   │   ├── logger.js          # Winston loglama
│   │   │   ├── pdf.util.js        # PDF uretim (transkript)
│   │   │   ├── response.util.js   # Standart API yanit formati
│   │   │   └── token.util.js      # JWT uretim ve dogrulama
│   │   └── validators/           # 16 validator dosyasi (Zod/espress-validator)
│   ├── server.js                 # Uygulama giris noktasi
│   └── package.json
├── frontend/
│   └── src/
│       ├── api/                  # Axios servis fonksiyonlari
│       │   ├── axiosInstance.js   # Axios ornegi (baseURL, interceptor)
│       │   ├── academic.api.js   # Fakulte, bolum, ders, sube API
│       │   ├── dashboard.api.js  # Dashboard istatistikleri API
│       │   ├── people.api.js     # Ogrenci, akademisyen API
│       │   ├── records.api.js    # Kayit, not, devamsizlik API
│       │   └── system.api.js     # Kullanici, rol, log, dosya API
│       ├── assets/               # Statik dosyalar (gorseller)
│       ├── components/
│       │   ├── ui/               # Paylasilan temel bilesenler
│       │   │   └── index.jsx     # StatCard, PageHeader, Badge, StatusBadge,
│       │   │                     # Skeleton, ErrorState, EmptyState, Modal,
│       │   │                     # ConfirmDialog, Pagination, SearchInput,
│       │   │                     # Select, Tabs, Table
│       │   ├── layout/
│       │   │   ├── Sidebar.jsx   # Rol bazli navigasyon, responsive drawer
│       │   │   └── Topbar.jsx    # Ust bar, profil, tema degistirici
│       │   └── feature/          # Ozel bilesenler
│       │       ├── AnnouncementCard.jsx
│       │       ├── AttendanceSummary.jsx
│       │       ├── CourseSectionCard.jsx
│       │       ├── DashboardCard.jsx
│       │       ├── ExamListItem.jsx
│       │       ├── GradeBadge.jsx
│       │       ├── PersonRow.jsx
│       │       └── ScheduleGrid.jsx
│       ├── context/
│       │   ├── AuthContext.jsx   # Kimlik dogrulama durumu
│       │   └── ThemeContext.jsx  # Dark/light tema yonetimi
│       ├── hooks/                # Ozel hook'lar
│       │   ├── useDebouncedSearch.js
│       │   ├── useFilters.js
│       │   ├── useHelpers.js
│       │   ├── useModal.js
│       │   └── usePagination.js
│       ├── layouts/
│       │   ├── AuthLayout.jsx    # Giris/kayit sayfa sablonu
│       │   └── DashboardLayout.jsx # Ana uygulama sablonu
│       ├── pages/
│       │   ├── auth/
│       │   │   ├── Login.jsx
│       │   │   ├── ForgotPassword.jsx
│       │   │   └── ResetPassword.jsx
│       │   ├── admin/            # 14 sayfa
│       │   │   ├── Dashboard.jsx
│       │   │   ├── UserList.jsx
│       │   │   ├── RoleList.jsx
│       │   │   ├── FacultyList.jsx
│       │   │   ├── DepartmentList.jsx
│       │   │   ├── StudentList.jsx
│       │   │   ├── StudentDetail.jsx
│       │   │   ├── LecturerList.jsx
│       │   │   ├── LecturerDetail.jsx
│       │   │   ├── CourseList.jsx
│       │   │   ├── CourseSectionList.jsx
│       │   │   ├── CourseSectionWorkspace.jsx
│       │   │   ├── AdvisorAssignmentList.jsx
│       │   │   └── LogList.jsx
│       │   ├── academician/      # 5 sayfa
│       │   │   ├── Dashboard.jsx
│       │   │   ├── MyCourseSections.jsx
│       │   │   ├── CourseSectionWorkspace.jsx
│       │   │   ├── Advisees.jsx
│       │   │   └── MyTeachingSchedule.jsx
│       │   ├── student/          # 8 sayfa
│       │   │   ├── Dashboard.jsx
│       │   │   ├── WeeklySchedule.jsx
│       │   │   ├── ExamSchedule.jsx
│       │   │   ├── MyGrades.jsx
│       │   │   ├── Transcript.jsx
│       │   │   ├── CourseCatalog.jsx
│       │   │   ├── CourseSelection.jsx
│       │   │   └── MyAttendance.jsx
│       │   ├── shared/           # 4 paylasilan sayfa
│       │   │   ├── AnnouncementList.jsx
│       │   │   ├── AnnouncementDetail.jsx
│       │   │   ├── AcademicCalendar.jsx
│       │   │   └── Profile.jsx
│       │   ├── Forbidden.jsx     # 403 sayfasi
│       │   ├── NotFound.jsx      # 404 sayfasi
│       │   └── RoleRedirect.jsx  # Rol bazli yonlendirme
│       ├── routes/
│       │   ├── index.jsx         # Tum route tanimlari
│       │   └── ProtectedRoute.jsx # Kimlik + rol korumali route sarmalayici
│       ├── services/             # React Query hook'lari
│       │   ├── useAcademic.js    # Fakulte, bolum, ders, sube
│       │   ├── useDashboard.js   # Dashboard istatistikleri
│       │   ├── usePeople.js      # Ogrenci, akademisyen
│       │   ├── useRecords.js     # Kayit, not, devamsizlik, danisman
│       │   └── useSystem.js      # Kullanici, rol, log, dosya, duyuru, takvim
│       ├── utils/
│       │   ├── constants.js      # Tum sabitler (roller, donemler, notlar, renkler)
│       │   ├── date.js           # Day.js yardimci fonksiyonlari
│       │   └── helpers.js        # Genel yardimci fonksiyonlar
│       ├── index.css             # Global stiller, design tokens, animasyonlar
│       ├── App.jsx               # Root bilesen
│       └── main.jsx              # React giris noktasi
├── .gitignore
├── package.json                  # Root monorepo scripts
└── README.md
```

---

## API Endpoint Ozeti

Swagger UI uzerinden tum endpoint'lerin detayli dokumasyonu goruntulenebilir.
Asagida modullere gore kategorize edilmis endpoint listesi yer almaktadir.

### Auth — `/api/v1/auth`

| Method | Path | Aciklama | Yetki |
|--------|------|----------|-------|
| POST | /login | Kullanici girisi | Herkes |
| POST | /logout | Cikis | Herkes |
| POST | /refresh | Token yenileme | Herkes |
| POST | /forgot-password | Sifre sifirlama e-postasi | Herkes |
| POST | /reset-password | Sifre sifirlama | Herkes |
| PUT | /change-password | Sifre degistirme | Giris yapan |

### Kullanici & Roller — `/api/v1/users`, `/api/v1/roles`

| Method | Path | Aciklama | Yetki |
|--------|------|----------|-------|
| GET | /users/me | Mevcut kullanici bilgisi | Herkes |
| PUT | /users/me | Mevcut kullaniciyi guncelle | Herkes |
| GET | /users | Tum kullanicilari listele | Admin |
| POST | /users | Yeni kullanici olustur | Admin |
| PUT | /users/:id | Kullanici guncelle | Admin |
| PUT | /users/:id/status | Aktif/pasif yap | Admin |
| GET | /roles | Tum rolleri listele | Admin |
| PUT | /roles/:id | Rol guncelle | Admin |

### Akademik Yapi — `/api/v1/faculties`, `/api/v1/departments`, `/api/v1/courses`, `/api/v1/course-sections`

| Method | Path | Aciklama | Yetki |
|--------|------|----------|-------|
| GET | /faculties | Fakulte listesi | Giris yapan |
| POST | /facultes | Fakulte olustur | Admin |
| PUT | /faculties/:id | Fakulte guncelle | Admin |
| DELETE | /faculties/:id | Fakulte sil | Admin |
| GET | /departments | Bolum listesi | Giris yapan |
| POST | /departments | Bolum olustur | Admin |
| PUT | /departments/:id | Bolum guncelle | Admin |
| DELETE | /departments/:id | Bolum sil | Admin |
| GET | /courses | Ders listesi | Giris yapan |
| POST | /courses | Ders olustur | Admin |
| PUT | /courses/:id | Ders guncelle | Admin |
| DELETE | /courses/:id | Ders sil | Admin |
| GET | /course-sections | Ders subesi listesi | Giris yapan |
| POST | /course-sections | Sube olustur | Admin |
| PUT | /course-sections/:id | Sube guncelle | Admin |
| PUT | /course-sections/:id/archive | Subeyi arsivle | Admin |
| DELETE | /course-sections/:id | Sube sil | Admin |
| GET | /course-sections/:id/grades | Sube notlari | Admin, Akademisyen |
| GET | /course-sections/:id/attendance | Sube devamsizliklari | Admin, Akademisyen |
| POST | /course-sections/:id/attendance | Yoklama kaydet | Akademisyen |
| GET | /course-sections/:id/weekly-schedule | Haftalik program | Giris yapan |
| POST | /course-sections/:id/weekly-schedule | Haftalik slot ekle | Admin |
| GET | /course-sections/:id/exam-schedule | Sinav programi | Giris yapan |
| POST | /course-sections/:id/exam-schedule | Sinav slotu ekle | Admin |
| GET | /course-sections/:id/materials | Ders materyalleri | Giris yapan |

### Ogrenci & Akademisyen — `/api/v1/students`, `/api/v1/lecturers`

| Method | Path | Aciklama | Yetki |
|--------|------|----------|-------|
| GET | /students | Ogrenci listesi | Admin, Akademisyen |
| GET | /students/:id | Ogrenci detay | Giris yapan |
| POST | /students | Ogrenci olustur | Admin |
| PUT | /students/:id | Ogrenci guncelle | Giris yapan |
| PUT | /students/:id/status | Aktif/pasif yap | Admin |
| GET | /lecturers | Akademisyen listesi | Giris yapan |
| GET | /lecturers/:id | Akademisyen detay | Giris yapan |
| POST | /lecturers | Akademisyen olustur | Admin |
| PUT | /lecturers/:id | Akademisyen guncelle | Giris yapan |
| PUT | /lecturers/:id/status | Aktif/pasif yap | Admin |

### Kayit & Danisman — `/api/v1/enrollments`, `/api/v1/advisor-assignments`

| Method | Path | Aciklama | Yetki |
|--------|------|----------|-------|
| GET | /enrollments | Tum kayitlar | Giris yapan |
| GET | /enrollments/me | Ogrencinin kendi kayitlari | Ogrenci |
| POST | /enrollments | Yeni kayit talebi | Ogrenci |
| PUT | /enrollments/:id/approve | Kaydi onayla | Admin, Akademisyen |
| PUT | /enrollments/:id/reject | Kaydi reddet | Admin, Akademisyen |
| PUT | /enrollments/:id/drop | Kaydi dusur | Ogrenci |
| GET | /advisor-assignments | Danisman atama listesi | Admin |
| GET | /advisor-assignments/lecturer/:id/students | Danismanin ogrencileri | Admin, Akademisyen |
| POST | /advisor-assignments | Danisman ata | Admin |
| PUT | /advisor-assignments/:id/deactivate | Danismanligi kaldir | Admin |

### Not & Devamsizlik — `/api/v1/grades`, `/api/v1/attendance`

| Method | Path | Aciklama | Yetki |
|--------|------|----------|-------|
| GET | /grades/me | Ogrencinin notlari | Ogrenci |
| GET | /grades/transcript/me | Ogrenci transkripti | Ogrenci |
| GET | /grades/transcript/me/pdf | Transkript PDF indir | Ogrenci |
| PUT | /grades/:enrollmentId | Not guncelle | Admin, Akademisyen |
| PUT | /grades/:enrollmentId/finalize | Notu kesinlestir | Admin, Akademisyen |
| GET | /attendance/me | Ogrencinin devamsizliklari | Ogrenci |

### Program & Duyuru & Takvim — `/api/v1/weekly-schedule`, `/api/v1/exam-schedule`, `/api/v1/announcements`, `/api/v1/academic-calendar`

| Method | Path | Aciklama | Yetki |
|--------|------|----------|-------|
| GET | /weekly-schedule/me | Kisinin haftalik programi | Ogrenci, Akademisyen |
| PUT | /weekly-schedule/:id | Haftalik slot guncelle | Admin |
| DELETE | /weekly-schedule/:id | Haftalik slot sil | Admin |
| GET | /exam-schedule/me | Kisinin sinav programi | Giris yapan |
| PUT | /exam-schedule/:id | Sinav slotu guncelle | Admin |
| DELETE | /exam-schedule/:id | Sinav slotu sil | Admin |
| GET | /announcements | Duyuru listesi | Giris yapan |
| GET | /announcements/:id | Duyuru detay | Giris yapan |
| POST | /announcements | Duyuru olustur | Admin |
| PUT | /announcements/:id | Duyuru guncelle | Admin |
| DELETE | /announcements/:id | Duyuru sil | Admin |
| GET | /academic-calendar | Takvim olaylari | Giris yapan |
| GET | /academic-calendar/:id | Takvim olayi detay | Giris yapan |
| POST | /academic-calendar | Takvim olayi olustur | Admin |
| PUT | /academic-calendar/:id | Takvim olayi guncelle | Admin |
| DELETE | /academic-calendar/:id | Takvim olayi sil | Admin |

### Dashboard — `/api/v1/dashboard`

| Method | Path | Aciklama | Yetki |
|--------|------|----------|-------|
| GET | /dashboard/student | Ogrenci dashboard | Ogrenci |
| GET | /dashboard/academician | Akademisyen dashboard | Akademisyen |
| GET | /dashboard/admin | Admin dashboard | Admin |

### Dosya & Log — `/api/v1/uploads`, `/api/v1/logs`

| Method | Path | Aciklama | Yetki |
|--------|------|----------|-------|
| POST | /uploads | Dosya yukle (multipart) | Giris yapan |
| PUT | /uploads/me/photo | Profil fotografini guncelle | Giris yapan |
| DELETE | /uploads/:id | Dosya sil | Giris yapan |
| GET | /logs | Sistem loglari | Admin |

---

## Veritabani Semasi

26 model ve 13 enum ile tam akademik yapi modellemesi:

### Ana Modeller

- **Role** — Kullanici rolleri (ADMIN, ACADEMICIAN, STUDENT)
- **User** — Kimlik bilgileri, sifre, son giris
- **RefreshToken** — JWT refresh token depolama
- **Faculty** — Fakulte (ad, kod)
- **Department** — Bolum (ad, kod, fakulte baglantisi)
- **Student** — Ogrenci (ogrenci no, tc kimlik, ad, soyad, sinif, GPA)
- **Lecturer** — Akademisyen (unvan, ad, soyad)
- **AdvisorAssignment** — Danisman atama (ogrenci, akademisyen, yil)
- **Course** — Ders (kod, ad, kredi, AKTS)
- **CourseSection** — Ders subesi (yil, donem, kontenjan, sinif)
- **Enrollment** — Ogrenci kaydi (durum: PENDING/APPROVED/REJECTED/ACTIVE/COMPLETED/DROPPED)
- **Grade** — Not (ara sinav, final, butunleme, harf notu, not katsayisi)
- **Attendance** — Devamsizlik (tarih, durum: PRESENT/ABSENT/EXCUSED)
- **WeeklySchedule** — Haftalik program (gun, baslangic/bitis saati, sinif)
- **ExamSchedule** — Sinav programi (tur, tarih, saati, sinif, gorevli)
- **Announcement** — Duyuru (baslik, icerik, kategori, hedef rol)
- **AcademicCalendar** — Akademik takvim (baslik, tarih araligi, kategori)
- **Upload** — Yuklenen dosyalar (dosya adi, tur, boyut, amaç)
- **Log** — Sistem loglari (islem, varlik, IP, meta veri)

### Enum Turleri

| Enum | Degerler |
|------|----------|
| RoleName | ADMIN, ACADEMICIAN, STUDENT |
| Semester | FALL, SPRING, SUMMER |
| EnrollmentStatus | PENDING, APPROVED, REJECTED, ACTIVE, COMPLETED, DROPPED |
| LetterGrade | AA, BA, BB, CB, CC, DC, DD, FD, FF |
| AttendanceStatus | PRESENT, ABSENT, EXCUSED |
| AnnouncementCategory | GENERAL, ACADEMIC, EXAM, EVENT |
| TargetRole | ALL, STUDENT, ACADEMICIAN, ADMIN |
| CalendarCategory | REGISTRATION, EXAM, HOLIDAY, SEMESTER_START, SEMESTER_END, OTHER |
| ExamType | MIDTERM, FINAL, MAKEUP |
| DayOfWeek | MONDAY through SUNDAY |
| UploadPurpose | PROFILE_PHOTO, COURSE_MATERIAL, OTHER |

---

## Mimari

### Backend: Katmanli Mimari

```
Route (dogrulama + yetkilendirme)
  └── Controller (HTTP istek/yanit)
        └── Service (is mantigi, kurallar)
              └── Repository (Prisma sorgulari)
                    └── Prisma Client (PostgreSQL)
```

- **Route**: `express-validator` ile giris dogrulama, `authorize()` ile rol kontrolu
- **Controller**: Request parse, service cagrisi, response formati
- **Service**: Is kurallari, yetkilendirme kontrolu, hash/slug uretimi
- **Repository**: Prisma ORM sorgulari, include/where/orderBy tanimlari

### Frontend: Bilesen Tabanli Mimari

```
Route (React Router)
  └── Layout (Sidebar + Topbar)
        └── Page (sayfa bileseni)
              └── Feature Components (ozel bilesenler)
              └── UI Components (paylasilan temel bilesenler)
              └── Services (React Query hook'lari)
                    └── API (Axios fonksiyonlari)
```

- **Services**: `useQuery`, `useMutation`, `useInfiniteQuery` ile sunucu durumu yonetimi
- **Hooks**: `usePagination`, `useDebouncedSearch`, `useFilters`, `useModal` tekrar kullanilabilir
- **Context**: `AuthContext` (kimlik), `ThemeContext` (tema) global durum saglar
- **Constants**: Tum sabitler (roller, donemler, not harfleri, renkler) merkezi dosyada

---

## Guvenlik

- **JWT**: Access token 15 dakika, refresh token 7 gun sureli
- **HttpOnly Cookie**: Refresh token tarayici erisimine kapali
- **Bcrypt**: Sifreler 12 round ile hashlenir
- **Helmet**: Tum HTTP header'lari guvenli olarak ayarlanir
- **CORS**: Yalnizca frontend adresinden gelen isteklere izin verilir
- **Rate Limit**: Giris denemeleri ip bazli olarak sinirlandirilir
- **RBAC**: Her route'ta rol kontrolu (authenticate + authorize middleware)
- **Giris Dogrulama**: Tum POST/PUT endpoint'lerinde Zod/express-validator ile veri dogrulama
- **Upload Kısıtlamasi**: Dosya boyutu siniri (10 MB), izin verilen formatlar (whitelist)
- **.gitignore**: `.env`, `node_modules`, `uploads/`, `dist/` dosyalari versiyon kontrolu disinda

---

## Gelistirme Asamalari

| Asama | Icerik | Durum |
|-------|--------|-------|
| Faz 1 | Frontend altyapisi: paylasilan bilesenler, hook'lar, servisler, sabitler, yardimcilar | Tamamlandi |
| Faz 2 | Backend akademik yapi CRUD: fakulte, bolum, ders, sube, ogrenci, akademisyen | Tamamlandi |
| Faz 3 | Kayit ve danisman: ders secme, kontenjan/AKTS kontrolu, danisman onayi | Tamamlandi |
| Faz 4 | Not ve devamsizlik: not girisi, harf notu, GPA, transkript PDF, yoklama | Tamamlandi |
| Faz 5 | Takvim, program ve duyuru: haftalik/sinav programi, duyuru, akademik takvim | Tamamlandi |
| Faz 6 | Admin paneli: kullanici/rol yonetimi, log, dosya yukleme/silme | Tamamlandi |
| Faz 7 | Cilalama: dark mode, animasyonlar, responsive duzeltmeleri, swagger dokumasyonu | Tamamlandi |

---

## Lisans

Bu proje ogretim amacli olarak gelistirilmistir.
