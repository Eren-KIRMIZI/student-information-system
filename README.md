# OBS — Ogrenci Bilgi Sistemi

Fakulte, bolum, ders, ogrenci, akademisyen, kayit, not, devamsizlik, duyuru ve takvim
islemlerini tek bir platform uzerinden yonetmek icin gelistirilmis kapsamli bir web
uygulamasi. Monorepo mimarisi ile backend ve frontend tek bir depo icinde barindirilir.

<img width="317" height="317" alt="Uni-Photoroom" src="https://github.com/user-attachments/assets/8182fde1-1b90-4ca5-ba0f-7c5a7a8f392c" />

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

### Onbellek (Cache)

- Memurai (Redis uyumlu) ile servis katmaninda onbellek
- Dashboard sorgulari 60 saniye, akademik yapı 24 saat, duyurular 180 saniye sure ile onbelleklenir
- CRUD islemlerinde otomatik cache temizleme (invalidation)
- `CACHE_ENABLED` ortam degiskeni ile acma/kapama kontrolu
- Redis baglantisi koparsa uygulama Prisma uzerinden calismaya devam eder

### Gercek Zamanli Bildirimler (WebSocket)

- Socket.IO ile sunucu tarafli olay bildirimleri
- JWT token ile kimlik dogrulama (gateway auth)
- Rol bazli odalara otomatik katilma (`role:admin`, `role:academician`, `role:student`)
- Kullanici bazli odalar: `student:{id}`, `lecturer:{id}`, `admin:{id}`
- Olay turleri:
  - Duyuru olustur/guncelle/sil -> ilgili rolu hedefler
  - Not guncelle/kesinlestir -> ogrenciye bildirim
  - Kayit olustur/onayla/reddet -> ogrenci + admin/akademisyen odalari
  - Devamsizlik kaydi -> ders subesi odasi
  - Takvim olustur/guncelle/sil -> broadcast
  - Kullanici durum degisikligi -> ilgili kisiye
- Frontend: `useSocket` hook'lari ile React Query cache invalidation + toast bildirimleri

### Enterprise Ozellikler

#### Katman 0 — Temel Altyapi

- **Feature Flags**: ENV tabanli ozellik acma/kapama (`CACHE_ENABLED`, `AUDIT_ENABLED`, `QUEUE_ENABLED`, vb.)
- **Request ID**: Her istege `X-Request-ID` header'i eklenir, yanit header'inda dondurulur
- **Correlation ID**: `AsyncLocalStorage` ile async scope boyunca korelasyon kimligi tasima
- **Response Compression**: Gzip seviye 6, 1KB altindaki yanitlar sikistirilmaz
- **Maintenance Mode**: `MAINTENANCE_MODE=true` ile tum yazma isteklerini engelleme (auth akislari calisir)

#### Katman 1 — Guvenlik ve Veri Koruma

- **Redis Rate Limit**: `rate-limit-redis` ile cok sunuculu ortamda guvenli sinirlama
  - Auth: 15 dk'da 5 deneme (prod) / 50 (dev)
  - Genel: 60/dk, Yazma: 30/dk
- **ETag**: Yanit icerik hash'i, 304 Not Modified destegi (zayif ETag)
- **Audit Log**: Tum POST/PUT/DELETE islemleri otomatik kayit
  - Kullanici, islem, varlik, IP, user agent, sure, korelasyon ID
  - `before`/`after` JSON snapshot'lari
  - `AUDIT_ENABLED` ile acma/kapama
- **System Settings**: Veritabani tabanli dinamik ayar yonetimi (admin panelinden guncellenebilir)
  - Key-value yapisi, kategori bazli gruplama
  - Cache ile hizli erisim, guncellemede otomatik invalidation

#### Katman 2 — Is Mantigi

- **Background Jobs (BullMQ)**:
  - Email kuyrugusu (3 deneme, exponential backoff)
  - Notification kuyrugusu
  - Report kuyrugusu
  - Cleanup kuyrugusu
  - Producer/worker ayrimi, baglanti paylasimi
- **Scheduled Jobs**: Cron tabanli zamanlanmis isler
  - Suresi dolmus refresh token temizleme (her gun 03:00)
  - Suresi dolmus idempotency temizleme (her gun 04:00)
  - Donem raporlari uretme (1/5/9. ay basinda)
- **Cursor Pagination**: Prisma cursor API ile verimli sayfalama
  - `hasNext`, `nextCursor` ile frontend'de sonsuz kaydirma destegi
- **Idempotency**: Ayni istemin tekrar tekrar islenmesini engelleme
  - SHA-256 hash (kullanici + endpoint + key)
  - 24 saat TTL, POST/PUT istekleri icin
  - `Idempotency-Key` header'i
- **Optimistic Locking**: Eşzamanli guncelleme catismalarini onleme
  - `updatedAt` karsilastirmasi, 409 Conflict
- **Global Search**: Tek endpoint uzerinden coklu arama
  - `/api/v1/search?q=...` -> ogrenci, akademisyen, ders, bolum, duyuru
  - Kategori bazli ayri arama endpoint'leri

#### Katman 3 — Gozlemlilik

- **Tracing Middleware**: Her HTTP istegi icin span olusturma, sure olcme
- **Correlation Propagation**: Request ID tum servis ve log katmanlarinda tasima

#### Katman 4 — Test

- **Jest + Supertest**: Unit ve integration test altyapisi
  - Prisma mock, cache mock
  - Cursor pagination, audit log, system settings unit testleri
  - Faculty ve search API integration testleri
  - `npm run test` ile calistirma

### Arayuz

- Tum uygulama genelinde dark mode (acik/karanlik tema)
- Responsive tasarim: mobil, tablet, masaustu uyumlu
- Skeleton yukleme animasyonlari
- Toast bildirim sistemi (basari/hata)
- Modal dialoglar
- Tab navigasyonu
- Filtreleme ve arama
- Sayfalama (pagination)
- Hizli giris butonlari: giris ekraninda rol bazli tek tikla hesap secme

---

## Teknolojiler

### Backend

| Paket | Surum | Amac |
|-------|-------|------|
| Node.js | 18+ | Calistirma ortami |
| Express | 4.21 | HTTP framework |
| Prisma | 7.8 | ORM + veritabani migration |
| PostgreSQL | 14+ | Veritabani |
| ioredis | 5.6 | Memurai/Redis baglantisi (onbellek + rate limit + queue) |
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
| rate-limit-redis | 6.0 | Redis tabanli rate limiting |
| express-rate-limit | 7.5 | Rate limiting (fallback) |
| compression | 1.8 | Gzip response sikistirma |
| bullmq | 5.34 | Background job kuyruklari |
| socket.io | 4.8 | WebSocket gercek zamanli bildirimler |
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
| socket.io-client | 4.8 | WebSocket gercek zamanli bildirimler |

### Altyapi Servisleri

| Servis | Amac |
|--------|------|
| Memurai | Redis uyumlu onbellek sunucusu |
| concurrently | Backend ve frontend ayni anda calistirma |
| Prisma Studio | Veritabani gorsellestirme |

---

## Onkosullar

- Node.js 18 ve ustu
- npm 9 ve ustu
- PostgreSQL 14 ve ustu
- Memurai veya Redis (onbellek icin, opsiyonel)
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
JWT_SECRET="guvenli-access-token-gizli-anahtari"
JWT_REFRESH_SECRET="guvenli-refresh-token-gizli-anahtari"
ACCESS_TOKEN_EXPIRES="15m"
REFRESH_TOKEN_EXPIRES="7d"
CORS_ORIGIN="http://localhost:5173"
PORT=5000
MAX_ECTS_PER_SEMESTER=45
REDIS_URL="redis://127.0.0.1:6379"
CACHE_ENABLED=true
AUDIT_ENABLED=true
QUEUE_ENABLED=true
RATE_LIMIT_ENABLED=true
COMPRESSION_ENABLED=true
ETAG_ENABLED=true
REGISTRATION_ENABLED=true
MAINTENANCE_MODE=false
```

### 4. Veritabani Olusturma ve Migration

```bash
cd backend
npx prisma db push
# veya migration ile:
# npx prisma migrate dev --name init
```

### 5. Seed Verisi Yukleme

```bash
npx prisma db seed
```

Bu islem varsayilan admin, akademisyen ve ogrenci hesaplarini olusturur.

### 6. Prisma Client Uretimi

```bash
npx prisma generate
```

### 7. Memurai (Onbellek)

Onbellek opsiyoneldir. Memurai yuklu degilse `CACHE_ENABLED=false` olarak
`.env` dosyasinda tanimlayabilirsiniz. Bu durumda uygulama Prisma uzerinden
dogrudan veritabanina sorgu yaparak calismaya devam eder.

Memurai yuklu ise varsayilan olarak `127.0.0.1:6379` portunda dinler.
Windows uzerinde hizmet olarak kurulabilir:

```bash
# Memurai Developer Surumu (Windows)
# https://www.memurai.com/get-started
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

Seed verisi ile olusturulan hesaplar. Giris ekraninda hizli giris butonlari
ile tek tikla dolurulabilir.

| Rol | E-posta | Sifre |
|-----|---------|-------|
| Admin | admin@obs.edu.tr | Admin123! |
| Akademisyen | ayse.kaya@obs.edu.tr | Academic123! |
| Ogrenci | ali.veli@obs.edu.tr | Student123! |

---

## Proje Yapisi

```
student-information-system/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Veritabani semasi (29 model, 13 enum)
│   │   ├── seed.js                # Varsayilan veri seti
│   │   └── migrations/            # Veritabani migration dosyalari
│   ├── uploads/                   # Yuklenen dosyalar (disk)
│   ├── __tests__/                 # Test dosyalari
│   │   ├── unit/                  # Unit testler
│   │   │   ├── cursorPagination.test.js
│   │   │   ├── audit.test.js
│   │   │   └── settings.test.js
│   │   └── integration/           # Integration testler
│   │       └── faculty.test.js
│   ├── __mocks__/                 # Test mock'lari
│   │   ├── prisma.js              # Prisma client mock
│   │   ├── cache.js               # Cache mock
│   │   └── setup.js               # Mock kurulum
│   ├── jest.config.js             # Jest konfigurasyonu
│   ├── src/
│   │   ├── config/
│   │   │   ├── prisma.js          # Prisma client ornegi
│   │   │   ├── redis.js           # ioredis baglanti konfigurasyonu
│   │   │   ├── socket.js          # Socket.IO sunucu + JWT auth
│   │   │   └── featureFlags.js    # ENV tabanli ozellik bayraklari
│   │   ├── controllers/           # 22 controller dosyasi
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
│   │   │   ├── log.controller.js
│   │   │   ├── setting.controller.js    # System settings CRUD
│   │   │   └── search.controller.js     # Global search
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js       # JWT dogrulama
│   │   │   ├── role.middleware.js       # Rol bazli yetkilendirme
│   │   │   ├── validate.middleware.js   # express-validator sonuc
│   │   │   ├── rateLimit.middleware.js  # Redis tabanli rate limiting
│   │   │   ├── error.middleware.js      # Merkezi hata yakalama
│   │   │   ├── requestId.middleware.js  # X-Request-ID + korelasyon
│   │   │   ├── compression.middleware.js # Gzip sikistirma
│   │   │   ├── etag.middleware.js       # ETag + 304 destegi
│   │   │   ├── idempotency.middleware.js # Tekrar islem engelleme
│   │   │   ├── maintenance.middleware.js # Bakim modu
│   │   │   └── tracing.middleware.js    # Istek suresi olcme
│   │   ├── queue/                 # BullMQ kuyruk yapisi
│   │   │   ├── connection.js      # Redis baglanti konfigurasyonu
│   │   │   ├── producer.js        # Kuyruk uretici fonksiyonlari
│   │   │   ├── worker.js          # Kuyruk isleyici fonksiyonlari
│   │   │   └── scheduler.js       # Zamanlanmis isler (cron)
│   │   ├── repositories/          # 18 repository dosyasi
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
│   │   │   ├── setting.repository.js    # System settings veri erisimi
│   │   │   ├── search.repository.js     # Global search sorgulari
│   │   │   ├── upload.repository.js
│   │   │   ├── user.repository.js
│   │   │   └── weeklySchedule.repository.js
│   │   ├── routes/               # 22 route dosyasi (swagger annotasyonlu)
│   │   ├── services/             # 18 service dosyasi
│   │   ├── swagger/
│   │   │   └── swagger.config.js  # OpenAPI 3.0 konfigurasyonu
│   │   ├── utils/
│   │   │   ├── appError.util.js   # Ozel hata sinifi
│   │   │   ├── audit.js           # Audit log helper + middleware
│   │   │   ├── cache.js           # Onbellek yardimci fonksiyonlari
│   │   │   ├── correlation.js     # AsyncLocalStorage korelasyon
│   │   │   ├── cursorPagination.js # Cursor tabanli sayfalama
│   │   │   ├── gradeScale.js      # Harf notu ve GPA hesaplama
│   │   │   ├── logger.js          # Winston loglama
│   │   │   ├── optimisticLock.js  # Optimistic locking utility
│   │   │   ├── pdf.util.js        # PDF uretim (transkript)
│   │   │   ├── response.util.js   # Standart API yanit formati
│   │   │   ├── token.util.js      # JWT uretim ve dogrulama
│   │   │   └── tracer.js          # Tracing/suure olcme
│   │   └── validators/           # 16 validator dosyasi (Zod/express-validator)
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
│       │   │                     # Select, FilterBar, Tabs, Table
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
│       │   ├── AuthContext.jsx   # Kimlik dogrulama durumu + socket yasam dongusu
│       │   └── ThemeContext.jsx  # Dark/light tema yonetimi
│       ├── hooks/                # Ozel hook'lar
│       │   ├── useDebouncedSearch.js
│       │   ├── useFilters.js
│       │   ├── useHelpers.js
│       │   ├── useModal.js
│       │   ├── usePagination.js
│       │   └── useSocket.js      # WebSocket event hook'lari
│       ├── layouts/
│       │   ├── AuthLayout.jsx    # Giris/kayit sayfa sablonu
│       │   └── DashboardLayout.jsx # Ana uygulama sablonu
│       ├── lib/
│       │   └── socket.js         # Socket.IO istemci singleton
│       ├── pages/
│       │   ├── auth/
│       │   │   ├── Login.jsx
│       │   │   ├── ForgotPassword.jsx
│       │   │   └── ResetPassword.jsx
│       │   ├── admin/            # 14 sayfa
│       │   ├── academician/      # 5 sayfa
│       │   ├── student/          # 8 sayfa
│       │   ├── shared/           # 4 paylasilan sayfa
│       │   ├── Forbidden.jsx     # 403 sayfasi
│       │   ├── NotFound.jsx      # 404 sayfasi
│       │   └── RoleRedirect.jsx  # Rol bazli yonlendirme
│       ├── routes/
│       │   ├── index.jsx         # Tum route tanimlari
│       │   └── ProtectedRoute.jsx # Kimlik + rol korumali route sarmalayici
│       ├── services/             # React Query hook'lari
│       │   ├── useAcademic.js
│       │   ├── useDashboard.js
│       │   ├── usePeople.js
│       │   ├── useRecords.js
│       │   └── useSystem.js
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
| POST | /faculties | Fakulte olustur | Admin |
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

### Ayarlar — `/api/v1/settings`

| Method | Path | Aciklama | Yetki |
|--------|------|----------|-------|
| GET | /settings | Tum ayarlari listele | Admin |
| GET | /settings/category/:category | Kategoriye gore ayarlar | Admin |
| GET | /settings/:key | Tekil ayar getir | Admin |
| PUT | /settings/:key | Ayar guncelle/olustur | Admin |
| DELETE | /settings/:key | Ayar sil | Admin |

### Arama — `/api/v1/search`

| Method | Path | Aciklama | Yetki |
|--------|------|----------|-------|
| GET | /search?q=... | Tum kategorilerde arama | Giris yapan |
| GET | /search/students?q=... | Ogrenci ara | Giris yapan |
| GET | /search/lecturers?q=... | Akademisyen ara | Giris yapan |
| GET | /search/courses?q=... | Ders ara | Giris yapan |

---

## Veritabani Semasi

29 model ve 13 enum ile tam akademik yapi modellemesi:

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
- **Upload** — Yuklenen dosyalar (dosya adi, tur, boyut, amac)
- **Log** — Sistem loglari (islem, varlik, IP, meta veri)

### Enterprise Modelleri

- **AuditLog** — Veri degisiklik kaydi (kullanici, islem, varlik, oncesi/sonrasi, sure, korelasyon ID)
- **SystemSetting** — Sistem ayarlari (key-value, kategori, guncelleme zaman damgasi)
- **IdempotencyRecord** — Tekrar islem Engellemesi (hash, yanit, sure)

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
              └── Cache (Memurai/Redis onbellek)
              └── Repository (Prisma sorgulari)
                    └── Prisma Client (PostgreSQL)
```

Enterprise middleware zinciri (sirayla):

```
Request ID + Correlation ID
  └── Compression (Gzip)
        └── Maintenance Check
          └── Helmet + CORS
            └── Morgan (HTTP log)
              └── JSON parse
                └── ETag
                  └── Audit Log
                    └── Tracing
                      └── Route Handler
                        └── Idempotency (POST/PUT icin)
                          └── Controller
                            └── Service
                              └── Repository
```

- **Route**: `express-validator` ile giris dogrulama, `authorize()` ile rol kontrolu
- **Controller**: Request parse, service cagrisi, response formati
- **Service**: Is kurallari, yetkilendirme kontrolu, cache yonetimi, socket emit
- **Cache**: `cache.get/set/del/invalidatePattern` ile servis seviyesinde onbellek
- **Repository**: Prisma ORM sorgulari, include/where/orderBy tanimlari
- **Socket**: JWT auth ile baglanti, rol/kullanici odalari, event emit (non-blocking)

### Backend: WebSocket Akisi

```
Sunucu tarafinda olay olusturur (servis)
  └── getIO().to('role:student').emit('announcement:created', data)
        └── Frontend: useAnnouncementSocket hook'u
              └── React Query cache invalidation + toast bildirim
```

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
- **Rate Limit**: Redis tabanli, cok sunuculu ortamda guvenli sinirlama
- **RBAC**: Her route'ta rol kontrolu (authenticate + authorize middleware)
- **Giris Dogrulama**: Tum POST/PUT endpoint'lerinde Zod/express-validator ile veri dogrulama
- **Upload Kismi**: Dosya boyutu siniri (10 MB), izin verilen formatlar (whitelist)
- **.gitignore**: `.env`, `node_modules`, `uploads/`, `dist/` dosyalari versiyon kontrolu disinda
- **Onbellek**: `CACHE_ENABLED` ile acma/kapama, Redis baglantisi koparsa uygulama bozulmaz
- **Request ID**: Her istege benzersiz kimlik, log ve hata takibi icin
- **ETag**: Icerik bazli onbellek dogrulama, bant genisligi tasarrufu
- **Idempotency**: Ayni islemin tekrarlanmasini engelleme (kuyrukta cift kayit onleme)
- **Optimistic Locking**: Eszamanli guncelleme catismalarini tespit etme
- **Maintenance Mode**: Bakim sirasinda yazma islemlerini engelleme
- **Audit Log**: Tum veri degisikliklerinin kayit altinda tutulmasi

---

## Test

```bash
# Tum testleri calistir
npm run test

# Coverage raporu
npm run test:coverage
```
