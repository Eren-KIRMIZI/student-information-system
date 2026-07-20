/**
 * OBS Large Seed Script
 * =====================
 * Gerçekçi test verisi oluşturur:
 *   20 Fakülte
 *   150 Bölüm
 *   100 Akademisyen
 *   1000 Öğrenci
 *   600 Ders
 *   3000 Kayıt (enrollment)
 *
 * Çalıştır: node prisma/seed-large.js
 */

import 'dotenv/config';
import pkg from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker/locale/tr';

const { PrismaClient } = pkg;
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ==================== HELPERS ====================

const hashPwd = (pwd) => bcrypt.hash(pwd, 10);
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const LETTERS = ['AA', 'BA', 'BB', 'CB', 'CC', 'DC', 'DD', 'FD', 'FF'];
const SEMESTERS = ['FALL', 'SPRING'];
const ENROLLMENT_STATUSES = ['ACTIVE', 'COMPLETED', 'DROPPED'];

// ==================== FAKÜLTE VERİSİ ====================

const FACULTIES = [
  { name: 'Mühendislik Fakültesi', code: 'MF' },
  { name: 'İktisadi ve İdari Bilimler Fakültesi', code: 'IBF' },
  { name: 'Fen-Edebiyat Fakültesi', code: 'FEF' },
  { name: 'Tıp Fakültesi', code: 'TF' },
  { name: 'Hukuk Fakültesi', code: 'HF' },
  { name: 'Eğitim Fakültesi', code: 'EGF' },
  { name: 'Mimarlık Fakültesi', code: 'MIMF' },
  { name: 'Güzel Sanatlar Fakültesi', code: 'GSF' },
  { name: 'İletişim Fakültesi', code: 'ILF' },
  { name: 'Diş Hekimliği Fakültesi', code: 'DHF' },
  { name: 'Eczacılık Fakültesi', code: 'ECZ' },
  { name: 'Veteriner Fakültesi', code: 'VTF' },
  { name: 'Ziraat Fakültesi', code: 'ZRF' },
  { name: 'Orman Fakültesi', code: 'ORF' },
  { name: 'Su Ürünleri Fakültesi', code: 'SUF' },
  { name: 'Spor Bilimleri Fakültesi', code: 'SBF' },
  { name: 'Sağlık Bilimleri Fakültesi', code: 'SAGF' },
  { name: 'Sosyal Bilimler Fakültesi', code: 'SOSF' },
  { name: 'Uluslararası İlişkiler Fakültesi', code: 'UIF' },
  { name: 'Uygulamalı Bilimler Fakültesi', code: 'UBF' },
];

// ==================== BÖLÜM VERİSİ ====================

const DEPARTMENTS_BY_FACULTY = {
  MF:   ['Bilgisayar Mühendisliği', 'Elektrik-Elektronik Mühendisliği', 'Makine Mühendisliği', 'İnşaat Mühendisliği', 'Kimya Mühendisliği', 'Endüstri Mühendisliği', 'Çevre Mühendisliği', 'Biyomedikal Mühendisliği'],
  IBF:  ['İşletme', 'İktisat', 'Kamu Yönetimi', 'Uluslararası Ticaret', 'Maliye', 'Muhasebe ve Finansman', 'Yönetim Bilişim Sistemleri', 'Ekonometri'],
  FEF:  ['Matematik', 'Fizik', 'Kimya', 'Biyoloji', 'Türk Dili ve Edebiyatı', 'Tarih', 'Coğrafya', 'Psikoloji', 'Sosyoloji'],
  TF:   ['Dahiliye', 'Cerrahi', 'Pediatri', 'Kardiyoloji', 'Nöroloji', 'Psikiyatri', 'Radyoloji', 'Anestezi'],
  HF:   ['Özel Hukuk', 'Kamu Hukuku', 'Uluslararası Hukuk'],
  EGF:  ['İlköğretim', 'Ortaöğretim', 'Okul Öncesi Eğitimi', 'Rehberlik ve Psikolojik Danışmanlık', 'Bilgisayar ve Öğretim Teknolojileri', 'Türkçe Öğretmenliği'],
  MIMF: ['Mimarlık', 'Şehir ve Bölge Planlama', 'İç Mimarlık', 'Peyzaj Mimarlığı'],
  GSF:  ['Resim', 'Müzik', 'Sahne Sanatları', 'Grafik Tasarım'],
  ILF:  ['Gazetecilik', 'Radyo Televizyon ve Sinema', 'Halkla İlişkiler', 'Reklamcılık'],
  DHF:  ['Diş Hekimliği'],
  ECZ:  ['Eczacılık'],
  VTF:  ['Veterinerlik'],
  ZRF:  ['Tarla Bitkileri', 'Bahçe Bitkileri', 'Zootekni', 'Toprak Bilimi'],
  ORF:  ['Orman Mühendisliği', 'Orman Endüstrisi Mühendisliği'],
  SUF:  ['Su Ürünleri Mühendisliği'],
  SBF:  ['Antrenörlük', 'Beden Eğitimi ve Spor Öğretmenliği', 'Spor Yöneticiliği'],
  SAGF: ['Hemşirelik', 'Fizyoterapi ve Rehabilitasyon', 'Beslenme ve Diyetetik', 'Odyoloji'],
  SOSF: ['Sosyal Hizmet', 'Çalışma Ekonomisi', 'Siyaset Bilimi'],
  UIF:  ['Uluslararası İlişkiler'],
  UBF:  ['Bankacılık ve Finans', 'Sigortacılık', 'Lojistik Yönetimi'],
};

// ==================== DERS TEMELLERİ ====================

const COURSE_BASES = [
  'Matematik', 'Fizik', 'Kimya', 'Biyoloji', 'İstatistik', 'Olasılık',
  'Algoritmalar', 'Veri Yapıları', 'Veritabanı', 'Ağlar', 'İşletim Sistemleri',
  'Yazılım Mühendisliği', 'Yapay Zeka', 'Makine Öğrenmesi', 'Derin Öğrenme',
  'Ekonomi', 'Muhasebe', 'Finans', 'Pazarlama', 'Yönetim',
  'Tarih', 'Felsefe', 'Sosyoloji', 'Psikoloji', 'Hukuk',
  'Termodinamik', 'Akışkanlar Mekaniği', 'Elektronik', 'Devre Analizi',
  'Lineer Cebir', 'Sayısal Yöntemler', 'Diferansiyel Denklemler',
  'Proje Yönetimi', 'İş Etiği', 'Türkçe', 'İngilizce', 'Almanca',
];

// ==================== MAIN ====================

async function main() {
  console.log('🌱 Büyük seed başlatılıyor...\n');
  const startTime = Date.now();

  // 1. ROLES
  console.log('📌 Roller oluşturuluyor...');
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN', description: 'Sistem yöneticisi' },
  });
  const academicianRole = await prisma.role.upsert({
    where: { name: 'ACADEMICIAN' },
    update: {},
    create: { name: 'ACADEMICIAN', description: 'Akademisyen/Öğretim üyesi' },
  });
  const studentRole = await prisma.role.upsert({
    where: { name: 'STUDENT' },
    update: {},
    create: { name: 'STUDENT', description: 'Öğrenci' },
  });
  console.log('  ✅ 3 rol\n');

  // 2. ADMIN USER
  await prisma.user.upsert({
    where: { email: 'admin@obs.edu.tr' },
    update: {},
    create: {
      email: 'admin@obs.edu.tr',
      password: await hashPwd('Admin123!'),
      roleId: adminRole.id,
    },
  });
  console.log('  ✅ Admin kullanıcı\n');

  // 3. FACULTIES (20)
  console.log('🏛️  Fakülteler oluşturuluyor...');
  const facultyMap = {};
  for (const f of FACULTIES) {
    const faculty = await prisma.faculty.upsert({
      where: { code: f.code },
      update: {},
      create: { name: f.name, code: f.code },
    });
    facultyMap[f.code] = faculty;
  }
  console.log(`  ✅ ${FACULTIES.length} fakülte\n`);

  // 4. DEPARTMENTS (~150)
  console.log('🏢 Bölümler oluşturuluyor...');
  const allDepartments = [];
  for (const [fCode, deptNames] of Object.entries(DEPARTMENTS_BY_FACULTY)) {
    const faculty = facultyMap[fCode];
    for (const deptName of deptNames) {
      const code = `${fCode}-${deptName.slice(0, 4).toUpperCase().replace(/\s/g, '')}`;
      const dept = await prisma.department.upsert({
        where: { code },
        update: {},
        create: { name: deptName, code, facultyId: faculty.id },
      });
      allDepartments.push(dept);
    }
  }
  console.log(`  ✅ ${allDepartments.length} bölüm\n`);

  // 5. ACADEMICS (100)
  console.log('👨‍🏫 Akademisyenler oluşturuluyor (100 kişi)...');
  const allLecturers = [];
  const TITLES = ['Prof. Dr.', 'Doç. Dr.', 'Dr. Öğr. Üyesi', 'Arş. Gör. Dr.', 'Arş. Gör.'];
  const SPECIALIZATIONS = [
    'Yapay Zeka', 'Veri Bilimi', 'Yazılım Mühendisliği', 'Ağ Güvenliği',
    'Makroekonomik Analiz', 'Finansal Piyasalar', 'Hukuki Metodoloji',
    'Biyomedikal Sistemler', 'Termodinamik', 'Elektromanyetizma',
    'Organik Kimya', 'Moleküler Biyoloji', 'Klinik Psikoloji', 'Sosyal Teori',
  ];

  for (let i = 0; i < 100; i++) {
    const firstName = faker.person.firstName();
    const lastName  = faker.person.lastName();
    const email     = faker.internet.email({ firstName, lastName, provider: 'obs.edu.tr' }).toLowerCase();
    const dept      = rand(allDepartments);
    const title     = rand(TITLES);

    try {
      const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          email,
          password: await hashPwd('Academic123!'),
          roleId: academicianRole.id,
        },
      });

      const lec = await prisma.lecturer.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          staffId: `STF${String(1000 + i).padStart(5, '0')}`,
          firstName,
          lastName,
          title,
          departmentId: dept.id,
          specialization: rand(SPECIALIZATIONS),
          phone: faker.phone.number(),
        },
      });
      allLecturers.push(lec);
    } catch {
      // Duplicate email — skip
    }

    if ((i + 1) % 25 === 0) console.log(`  ... ${i + 1}/100 akademisyen`);
  }
  console.log(`  ✅ ${allLecturers.length} akademisyen\n`);

  // 6. STUDENTS (1000)
  console.log('🎓 Öğrenciler oluşturuluyor (1000 kişi)...');
  const allStudents = [];
  const CURRENT_YEAR = new Date().getFullYear();

  for (let i = 0; i < 1000; i++) {
    const firstName = faker.person.firstName();
    const lastName  = faker.person.lastName();
    const email     = faker.internet
      .email({ firstName, lastName, provider: 'ogrenci.obs.edu.tr' })
      .toLowerCase()
      .replace(/[^a-z0-9@.]/g, '');
    const dept      = rand(allDepartments);
    const classYear = randInt(1, 4);
    const startYear = CURRENT_YEAR - classYear + 1;
    const studentNumber = `${startYear}${String(i + 1).padStart(6, '0')}`;
    const nationalId    = String(randInt(10000000000, 99999999999));

    try {
      const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          email,
          password: await hashPwd('Student123!'),
          roleId: studentRole.id,
        },
      });

      const student = await prisma.student.upsert({
        where: { studentNumber },
        update: {},
        create: {
          userId: user.id,
          studentNumber,
          nationalId,
          firstName,
          lastName,
          phone: faker.phone.number(),
          birthDate: faker.date.birthdate({ min: 18, max: 28, mode: 'age' }),
          classYear,
          departmentId: dept.id,
          gpa: parseFloat((Math.random() * 3.0 + 1.0).toFixed(2)),
          totalCredits: classYear * randInt(20, 35),
        },
      });
      allStudents.push(student);
    } catch {
      // Duplicate — skip
    }

    if ((i + 1) % 100 === 0) console.log(`  ... ${i + 1}/1000 öğrenci`);
  }
  console.log(`  ✅ ${allStudents.length} öğrenci\n`);

  // 7. COURSES (600)
  console.log('📚 Dersler oluşturuluyor (600 ders)...');
  const allCourses = [];
  const COURSE_TYPES = ['REQUIRED', 'ELECTIVE', 'COMMON', 'DEPARTMENT_ELECTIVE'];

  for (let i = 0; i < 600; i++) {
    const dept   = rand(allDepartments);
    const base   = rand(COURSE_BASES);
    const level  = randInt(1, 4);
    const num    = randInt(1, 9);
    const code   = `${dept.code.slice(0, 3)}-${level}0${num}`;
    const name   = `${base} ${level > 2 ? 'II ' : ''}(${dept.name.split(' ')[0]})`;

    try {
      const course = await prisma.course.upsert({
        where: { code },
        update: {},
        create: {
          code,
          name,
          credits: randInt(2, 5),
          ects: randInt(3, 8),
          departmentId: dept.id,
          courseType: rand(COURSE_TYPES),
          semester: rand(SEMESTERS),
          year: level,
          maxEnrollment: randInt(20, 60),
          description: `${name} dersi. ${faker.lorem.sentence()}`,
        },
      });
      allCourses.push(course);
    } catch {
      // Duplicate code — skip
    }

    if ((i + 1) % 100 === 0) console.log(`  ... ${i + 1}/600 ders`);
  }
  console.log(`  ✅ ${allCourses.length} ders\n`);

  // 8. ENROLLMENTS (3000)
  console.log('📋 Kayıtlar oluşturuluyor (3000 kayıt)...');
  let enrollmentCount = 0;
  const enrollmentSet = new Set();

  const enrollmentTargets = Math.min(3000, allStudents.length * 3);
  let attempts = 0;

  while (enrollmentCount < enrollmentTargets && attempts < enrollmentTargets * 3) {
    attempts++;
    const student = rand(allStudents);
    const course  = rand(allCourses);
    const key     = `${student.id}-${course.id}`;

    if (enrollmentSet.has(key)) continue;
    enrollmentSet.add(key);

    const status = rand(ENROLLMENT_STATUSES);
    const year   = CURRENT_YEAR - randInt(0, 3);

    try {
      const enrollment = await prisma.enrollment.create({
        data: {
          studentId: student.id,
          courseId: course.id,
          status,
          academicYear: `${year}-${year + 1}`,
          semester: rand(SEMESTERS),
        },
      });

      // Not ekle (completed enrollment için)
      if (status === 'COMPLETED') {
        const midterm = randInt(30, 100);
        const final   = randInt(30, 100);
        const avg     = midterm * 0.4 + final * 0.6;
        const letterGrade = avg >= 90 ? 'AA' : avg >= 80 ? 'BA' : avg >= 70 ? 'BB'
          : avg >= 65 ? 'CB' : avg >= 60 ? 'CC' : avg >= 55 ? 'DC'
          : avg >= 50 ? 'DD' : avg >= 45 ? 'FD' : 'FF';

        await prisma.grade.create({
          data: {
            enrollmentId: enrollment.id,
            midterm,
            final,
            average: parseFloat(avg.toFixed(1)),
            letterGrade,
            gpaPoints: letterGrade === 'AA' ? 4.0 : letterGrade === 'BA' ? 3.5
              : letterGrade === 'BB' ? 3.0 : letterGrade === 'CB' ? 2.5
              : letterGrade === 'CC' ? 2.0 : letterGrade === 'DC' ? 1.5
              : letterGrade === 'DD' ? 1.0 : 0.0,
          },
        }).catch(() => {});
      }

      enrollmentCount++;
    } catch {
      // Duplicate — skip
    }

    if (enrollmentCount % 500 === 0 && enrollmentCount > 0) {
      console.log(`  ... ${enrollmentCount}/${enrollmentTargets} kayıt`);
    }
  }
  console.log(`  ✅ ${enrollmentCount} kayıt\n`);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('═══════════════════════════════════════════');
  console.log(`✅ Büyük seed tamamlandı! (${elapsed}s)`);
  console.log(`   Fakülte:     ${FACULTIES.length}`);
  console.log(`   Bölüm:       ${allDepartments.length}`);
  console.log(`   Akademisyen: ${allLecturers.length}`);
  console.log(`   Öğrenci:     ${allStudents.length}`);
  console.log(`   Ders:        ${allCourses.length}`);
  console.log(`   Kayıt:       ${enrollmentCount}`);
  console.log('═══════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
