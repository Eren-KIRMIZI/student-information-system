import 'dotenv/config';
import pkg from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const { PrismaClient } = pkg;
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seed başlatılıyor...');

  // 1. ROLES
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

  console.log('✅ Roller oluşturuldu');

  // 2. FACULTIES
  const faculty1 = await prisma.faculty.upsert({
    where: { code: 'MF' },
    update: {},
    create: { name: 'Mühendislik Fakültesi', code: 'MF' },
  });
  const faculty2 = await prisma.faculty.upsert({
    where: { code: 'IBF' },
    update: {},
    create: { name: 'İktisadi ve İdari Bilimler Fakültesi', code: 'IBF' },
  });

  console.log('✅ Fakülteler oluşturuldu');

  // 3. DEPARTMENTS
  const deptCS = await prisma.department.upsert({
    where: { code: 'CS' },
    update: {},
    create: { name: 'Bilgisayar Mühendisliği', code: 'CS', facultyId: faculty1.id },
  });
  const deptEE = await prisma.department.upsert({
    where: { code: 'EE' },
    update: {},
    create: { name: 'Elektrik-Elektronik Mühendisliği', code: 'EE', facultyId: faculty1.id },
  });
  const deptMGMT = await prisma.department.upsert({
    where: { code: 'MGMT' },
    update: {},
    create: { name: 'İşletme', code: 'MGMT', facultyId: faculty2.id },
  });
  const deptECON = await prisma.department.upsert({
    where: { code: 'ECON' },
    update: {},
    create: { name: 'İktisat', code: 'ECON', facultyId: faculty2.id },
  });

  console.log('✅ Bölümler oluşturuldu');

  // 4. USERS + STUDENTS + LECTURERS
  const hashPwd = (pwd) => bcrypt.hash(pwd, 12);

  // Admin
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@obs.edu.tr' },
    update: {},
    create: {
      email: 'admin@obs.edu.tr',
      password: await hashPwd('Admin123!'),
      roleId: adminRole.id,
    },
  });

  // Akademisyenler
  const lec1User = await prisma.user.upsert({
    where: { email: 'ayse.kaya@obs.edu.tr' },
    update: {},
    create: {
      email: 'ayse.kaya@obs.edu.tr',
      password: await hashPwd('Academic123!'),
      roleId: academicianRole.id,
    },
  });
  const lec2User = await prisma.user.upsert({
    where: { email: 'mehmet.demir@obs.edu.tr' },
    update: {},
    create: {
      email: 'mehmet.demir@obs.edu.tr',
      password: await hashPwd('Academic123!'),
      roleId: academicianRole.id,
    },
  });
  const lec3User = await prisma.user.upsert({
    where: { email: 'fatma.yilmaz@obs.edu.tr' },
    update: {},
    create: {
      email: 'fatma.yilmaz@obs.edu.tr',
      password: await hashPwd('Academic123!'),
      roleId: academicianRole.id,
    },
  });

  // Öğrenciler
  const studentUsers = [];
  const studentData = [
    { email: 'ali.veli@obs.edu.tr', firstName: 'Ali', lastName: 'Veli', studentNumber: '20210001', nationalId: '11111111111', classYear: 3, deptId: deptCS.id },
    { email: 'zeynep.arslan@obs.edu.tr', firstName: 'Zeynep', lastName: 'Arslan', studentNumber: '20210002', nationalId: '22222222222', classYear: 3, deptId: deptCS.id },
    { email: 'emre.celik@obs.edu.tr', firstName: 'Emre', lastName: 'Çelik', studentNumber: '20210003', nationalId: '33333333333', classYear: 2, deptId: deptCS.id },
    { email: 'merve.acar@obs.edu.tr', firstName: 'Merve', lastName: 'Acar', studentNumber: '20210004', nationalId: '44444444444', classYear: 2, deptId: deptEE.id },
    { email: 'can.ozturk@obs.edu.tr', firstName: 'Can', lastName: 'Öztürk', studentNumber: '20210005', nationalId: '55555555555', classYear: 1, deptId: deptEE.id },
    { email: 'selin.koc@obs.edu.tr', firstName: 'Selin', lastName: 'Koç', studentNumber: '20210006', nationalId: '66666666666', classYear: 1, deptId: deptMGMT.id },
    { email: 'baran.sahin@obs.edu.tr', firstName: 'Baran', lastName: 'Şahin', studentNumber: '20210007', nationalId: '77777777777', classYear: 4, deptId: deptMGMT.id },
    { email: 'nisa.kurt@obs.edu.tr', firstName: 'Nisa', lastName: 'Kurt', studentNumber: '20210008', nationalId: '88888888888', classYear: 4, deptId: deptECON.id },
    { email: 'kerem.ay@obs.edu.tr', firstName: 'Kerem', lastName: 'Ay', studentNumber: '20210009', nationalId: '99999999999', classYear: 2, deptId: deptCS.id },
    { email: 'dilan.sen@obs.edu.tr', firstName: 'Dilan', lastName: 'Şen', studentNumber: '20210010', nationalId: '10101010101', classYear: 3, deptId: deptECON.id },
  ];

  for (const sd of studentData) {
    const u = await prisma.user.upsert({
      where: { email: sd.email },
      update: {},
      create: {
        email: sd.email,
        password: await hashPwd('Student123!'),
        roleId: studentRole.id,
      },
    });
    studentUsers.push({ user: u, ...sd });
  }

  // Lecturers profil
  const lec1 = await prisma.lecturer.upsert({
    where: { userId: lec1User.id },
    update: {},
    create: {
      userId: lec1User.id,
      firstName: 'Ayşe',
      lastName: 'Kaya',
      title: 'Prof. Dr.',
      departmentId: deptCS.id,
      phone: '05321111111',
    },
  });
  const lec2 = await prisma.lecturer.upsert({
    where: { userId: lec2User.id },
    update: {},
    create: {
      userId: lec2User.id,
      firstName: 'Mehmet',
      lastName: 'Demir',
      title: 'Doç. Dr.',
      departmentId: deptCS.id,
      phone: '05322222222',
    },
  });
  const lec3 = await prisma.lecturer.upsert({
    where: { userId: lec3User.id },
    update: {},
    create: {
      userId: lec3User.id,
      firstName: 'Fatma',
      lastName: 'Yılmaz',
      title: 'Dr. Öğr. Üyesi',
      departmentId: deptEE.id,
      phone: '05323333333',
    },
  });

  // Student profiller
  const students = [];
  for (const sd of studentUsers) {
    const s = await prisma.student.upsert({
      where: { userId: sd.user.id },
      update: {},
      create: {
        userId: sd.user.id,
        studentNumber: sd.studentNumber,
        nationalId: sd.nationalId,
        firstName: sd.firstName,
        lastName: sd.lastName,
        classYear: sd.classYear,
        departmentId: sd.deptId,
      },
    });
    students.push(s);
  }

  console.log('✅ Kullanıcılar, öğrenciler ve akademisyenler oluşturuldu');

  // 5. COURSES
  const courses = [];
  const courseData = [
    { code: 'CS101', name: 'Programlamaya Giriş', credit: 4, ects: 6, deptId: deptCS.id, description: 'Temel programlama kavramları' },
    { code: 'CS201', name: 'Veri Yapıları ve Algoritmalar', credit: 4, ects: 7, deptId: deptCS.id, description: 'Temel veri yapıları' },
    { code: 'CS301', name: 'Veritabanı Sistemleri', credit: 3, ects: 5, deptId: deptCS.id, description: 'İlişkisel veritabanları' },
    { code: 'CS401', name: 'Yazılım Mühendisliği', credit: 3, ects: 5, deptId: deptCS.id, description: 'Yazılım geliştirme süreçleri' },
    { code: 'CS302', name: 'Bilgisayar Ağları', credit: 3, ects: 5, deptId: deptCS.id, description: 'Ağ protokolleri ve mimarisi' },
    { code: 'EE101', name: 'Devre Teorisi', credit: 4, ects: 6, deptId: deptEE.id, description: 'Temel devre analizi' },
    { code: 'EE201', name: 'Sayısal Elektronik', credit: 3, ects: 5, deptId: deptEE.id, description: 'Dijital devre tasarımı' },
    { code: 'MGMT101', name: 'İşletmeye Giriş', credit: 3, ects: 5, deptId: deptMGMT.id, description: 'Temel işletme kavramları' },
    { code: 'MGMT201', name: 'Yönetim ve Organizasyon', credit: 3, ects: 5, deptId: deptMGMT.id, description: 'Organizasyon teorisi' },
    { code: 'ECON101', name: 'Mikroekonomi', credit: 3, ects: 5, deptId: deptECON.id, description: 'Mikro ekonomi teorisi' },
    { code: 'ECON201', name: 'Makroekonomi', credit: 3, ects: 5, deptId: deptECON.id, description: 'Makro ekonomi teorisi' },
  ];

  for (const cd of courseData) {
    const c = await prisma.course.upsert({
      where: { code: cd.code },
      update: {},
      create: { code: cd.code, name: cd.name, credit: cd.credit, ects: cd.ects, departmentId: cd.deptId, description: cd.description },
    });
    courses.push(c);
  }

  console.log('✅ Dersler oluşturuldu');

  // 6. COURSE SECTIONS
  const cs101 = courses.find((c) => c.code === 'CS101');
  const cs201 = courses.find((c) => c.code === 'CS201');
  const cs301 = courses.find((c) => c.code === 'CS301');
  const cs302 = courses.find((c) => c.code === 'CS302');
  const cs401 = courses.find((c) => c.code === 'CS401');
  const ee101 = courses.find((c) => c.code === 'EE101');

  const section1 = await prisma.courseSection.upsert({
    where: { courseId_academicYear_semester_lecturerId: { courseId: cs101.id, academicYear: '2024-2025', semester: 'FALL', lecturerId: lec1.id } },
    update: {},
    create: { courseId: cs101.id, lecturerId: lec1.id, academicYear: '2024-2025', semester: 'FALL', quota: 30, classroom: 'D101' },
  });
  const section2 = await prisma.courseSection.upsert({
    where: { courseId_academicYear_semester_lecturerId: { courseId: cs201.id, academicYear: '2024-2025', semester: 'FALL', lecturerId: lec1.id } },
    update: {},
    create: { courseId: cs201.id, lecturerId: lec1.id, academicYear: '2024-2025', semester: 'FALL', quota: 25, classroom: 'D102' },
  });
  const section3 = await prisma.courseSection.upsert({
    where: { courseId_academicYear_semester_lecturerId: { courseId: cs301.id, academicYear: '2024-2025', semester: 'FALL', lecturerId: lec2.id } },
    update: {},
    create: { courseId: cs301.id, lecturerId: lec2.id, academicYear: '2024-2025', semester: 'FALL', quota: 20, classroom: 'D201' },
  });
  const section4 = await prisma.courseSection.upsert({
    where: { courseId_academicYear_semester_lecturerId: { courseId: cs302.id, academicYear: '2024-2025', semester: 'FALL', lecturerId: lec2.id } },
    update: {},
    create: { courseId: cs302.id, lecturerId: lec2.id, academicYear: '2024-2025', semester: 'FALL', quota: 20, classroom: 'D202' },
  });
  const section5 = await prisma.courseSection.upsert({
    where: { courseId_academicYear_semester_lecturerId: { courseId: cs401.id, academicYear: '2024-2025', semester: 'FALL', lecturerId: lec1.id } },
    update: {},
    create: { courseId: cs401.id, lecturerId: lec1.id, academicYear: '2024-2025', semester: 'FALL', quota: 15, classroom: 'D301' },
  });
  const section6 = await prisma.courseSection.upsert({
    where: { courseId_academicYear_semester_lecturerId: { courseId: ee101.id, academicYear: '2024-2025', semester: 'FALL', lecturerId: lec3.id } },
    update: {},
    create: { courseId: ee101.id, lecturerId: lec3.id, academicYear: '2024-2025', semester: 'FALL', quota: 25, classroom: 'E101' },
  });

  console.log('✅ Ders şubeleri oluşturuldu');

  // 7. WEEKLY SCHEDULE (Faz 3 çakışma testi için)
  await prisma.weeklySchedule.upsert({
    where: { id: 'ws-section1-mon' },
    update: {},
    create: { id: 'ws-section1-mon', courseSectionId: section1.id, dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '11:00', classroom: 'D101' },
  }).catch(() => prisma.weeklySchedule.create({ data: { courseSectionId: section1.id, dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '11:00', classroom: 'D101' } }));

  await prisma.weeklySchedule.create({
    data: { courseSectionId: section1.id, dayOfWeek: 'WEDNESDAY', startTime: '09:00', endTime: '10:00', classroom: 'D101' },
  }).catch(() => {});

  await prisma.weeklySchedule.create({
    data: { courseSectionId: section2.id, dayOfWeek: 'TUESDAY', startTime: '13:00', endTime: '15:00', classroom: 'D102' },
  }).catch(() => {});

  await prisma.weeklySchedule.create({
    data: { courseSectionId: section3.id, dayOfWeek: 'THURSDAY', startTime: '10:00', endTime: '12:00', classroom: 'D201' },
  }).catch(() => {});

  await prisma.weeklySchedule.create({
    data: { courseSectionId: section4.id, dayOfWeek: 'FRIDAY', startTime: '09:00', endTime: '11:00', classroom: 'D202' },
  }).catch(() => {});

  await prisma.weeklySchedule.create({
    data: { courseSectionId: section5.id, dayOfWeek: 'MONDAY', startTime: '14:00', endTime: '16:00', classroom: 'D301' },
  }).catch(() => {});

  await prisma.weeklySchedule.create({
    data: { courseSectionId: section6.id, dayOfWeek: 'WEDNESDAY', startTime: '13:00', endTime: '15:00', classroom: 'E101' },
  }).catch(() => {});

  console.log('✅ Haftalık programlar oluşturuldu');

  // 8. ADVISOR ASSIGNMENTS
  await prisma.advisorAssignment.upsert({
    where: { studentId_lecturerId_academicYear: { studentId: students[0].id, lecturerId: lec1.id, academicYear: '2024-2025' } },
    update: {},
    create: { studentId: students[0].id, lecturerId: lec1.id, academicYear: '2024-2025', isActive: true },
  });
  await prisma.advisorAssignment.upsert({
    where: { studentId_lecturerId_academicYear: { studentId: students[1].id, lecturerId: lec1.id, academicYear: '2024-2025' } },
    update: {},
    create: { studentId: students[1].id, lecturerId: lec1.id, academicYear: '2024-2025', isActive: true },
  });
  await prisma.advisorAssignment.upsert({
    where: { studentId_lecturerId_academicYear: { studentId: students[2].id, lecturerId: lec2.id, academicYear: '2024-2025' } },
    update: {},
    create: { studentId: students[2].id, lecturerId: lec2.id, academicYear: '2024-2025', isActive: true },
  });

  console.log('✅ Danışman atamaları oluşturuldu');

  // 9. ENROLLMENTS + GRADES + ATTENDANCE (örnek)
  const enroll1 = await prisma.enrollment.upsert({
    where: { studentId_courseSectionId: { studentId: students[0].id, courseSectionId: section1.id } },
    update: {},
    create: { studentId: students[0].id, courseSectionId: section1.id, status: 'ACTIVE' },
  });
  const enroll2 = await prisma.enrollment.upsert({
    where: { studentId_courseSectionId: { studentId: students[0].id, courseSectionId: section3.id } },
    update: {},
    create: { studentId: students[0].id, courseSectionId: section3.id, status: 'ACTIVE' },
  });
  const enroll3 = await prisma.enrollment.upsert({
    where: { studentId_courseSectionId: { studentId: students[1].id, courseSectionId: section1.id } },
    update: {},
    create: { studentId: students[1].id, courseSectionId: section1.id, status: 'ACTIVE' },
  });
  const enroll4 = await prisma.enrollment.upsert({
    where: { studentId_courseSectionId: { studentId: students[2].id, courseSectionId: section2.id } },
    update: {},
    create: { studentId: students[2].id, courseSectionId: section2.id, status: 'PENDING' },
  });

  // Grades
  await prisma.grade.upsert({
    where: { enrollmentId: enroll1.id },
    update: {},
    create: { enrollmentId: enroll1.id, midtermScore: 78, finalScore: 85, letterGrade: 'BA', gradePoint: 3.5, isFinalized: true, enteredById: lec1.id },
  });
  await prisma.grade.upsert({
    where: { enrollmentId: enroll2.id },
    update: {},
    create: { enrollmentId: enroll2.id, midtermScore: 65, finalScore: null, isFinalized: false, enteredById: lec2.id },
  });
  await prisma.grade.upsert({
    where: { enrollmentId: enroll3.id },
    update: {},
    create: { enrollmentId: enroll3.id, midtermScore: 90, finalScore: 92, letterGrade: 'AA', gradePoint: 4.0, isFinalized: true, enteredById: lec1.id },
  });

  // Attendance
  const today = new Date();
  const lastWeek = new Date(today);
  lastWeek.setDate(today.getDate() - 7);

  await prisma.attendance.upsert({
    where: { enrollmentId_date: { enrollmentId: enroll1.id, date: lastWeek } },
    update: {},
    create: { enrollmentId: enroll1.id, date: lastWeek, status: 'PRESENT', recordedById: lec1.id },
  });
  await prisma.attendance.upsert({
    where: { enrollmentId_date: { enrollmentId: enroll3.id, date: lastWeek } },
    update: {},
    create: { enrollmentId: enroll3.id, date: lastWeek, status: 'ABSENT', recordedById: lec1.id },
  });

  console.log('✅ Kayıtlar, notlar ve devamsızlıklar oluşturuldu');

  // 10. EXAM SCHEDULE
  const examDate = new Date('2025-01-15');
  await prisma.examSchedule.create({
    data: { courseSectionId: section1.id, examType: 'MIDTERM', examDate, startTime: '10:00', endTime: '12:00', classroom: 'B101', supervisorId: lec1.id },
  }).catch(() => {});
  await prisma.examSchedule.create({
    data: { courseSectionId: section3.id, examType: 'MIDTERM', examDate: new Date('2025-01-17'), startTime: '14:00', endTime: '16:00', classroom: 'B201', supervisorId: lec2.id },
  }).catch(() => {});

  console.log('✅ Sınav programı oluşturuldu');

  // 11. ACADEMIC CALENDAR
  await prisma.academicCalendar.create({
    data: { title: '2024-2025 Güz Dönemi Başlangıcı', startDate: new Date('2024-09-23'), endDate: new Date('2024-09-23'), category: 'SEMESTER_START' },
  }).catch(() => {});
  await prisma.academicCalendar.create({
    data: { title: 'Vize Sınavları Haftası', startDate: new Date('2024-11-11'), endDate: new Date('2024-11-15'), category: 'EXAM' },
  }).catch(() => {});
  await prisma.academicCalendar.create({
    data: { title: 'Final Sınavları', startDate: new Date('2025-01-13'), endDate: new Date('2025-01-24'), category: 'EXAM' },
  }).catch(() => {});
  await prisma.academicCalendar.create({
    data: { title: 'Ders Kayıt Dönemi', startDate: new Date('2024-09-09'), endDate: new Date('2024-09-20'), category: 'REGISTRATION' },
  }).catch(() => {});
  await prisma.academicCalendar.create({
    data: { title: 'Cumhuriyet Bayramı', startDate: new Date('2024-10-29'), endDate: new Date('2024-10-29'), category: 'HOLIDAY', description: 'Cumhuriyet Bayramı tatili' },
  }).catch(() => {});

  console.log('✅ Akademik takvim oluşturuldu');

  // 12. ANNOUNCEMENTS
  await prisma.announcement.create({
    data: {
      title: 'Güz Dönemi Ders Kayıt Duyurusu',
      content: '2024-2025 Güz dönemi ders kayıtları 9-20 Eylül tarihleri arasında gerçekleştirilecektir. Danışmanınız ile görüşmeyi unutmayınız.',
      category: 'ACADEMIC',
      targetRole: 'STUDENT',
      publishedById: adminUser.id,
    },
  }).catch(() => {});
  await prisma.announcement.create({
    data: {
      title: 'Vize Sınavı Duyurusu',
      content: 'Vize sınavları 11-15 Kasım haftasında gerçekleştirilecektir. Sınav programları öğrenci bilgi sisteminden takip edilebilir.',
      category: 'EXAM',
      targetRole: 'ALL',
      publishedById: adminUser.id,
    },
  }).catch(() => {});
  await prisma.announcement.create({
    data: {
      title: 'Sistem Bakım Duyurusu',
      content: 'OBS sistemi 25 Ekim Cuma günü saat 22:00-02:00 arası bakım nedeniyle hizmet dışı olacaktır.',
      category: 'GENERAL',
      targetRole: 'ALL',
      publishedById: adminUser.id,
    },
  }).catch(() => {});

  console.log('✅ Duyurular oluşturuldu');

  console.log('\n🎉 Seed tamamlandı!');
  console.log('\n📋 Test Hesapları:');
  console.log('  Admin:       admin@obs.edu.tr        / Admin123!');
  console.log('  Akademisyen: ayse.kaya@obs.edu.tr    / Academic123!');
  console.log('  Akademisyen: mehmet.demir@obs.edu.tr / Academic123!');
  console.log('  Öğrenci:     ali.veli@obs.edu.tr     / Student123!');
  console.log('  Öğrenci:     zeynep.arslan@obs.edu.tr/ Student123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
