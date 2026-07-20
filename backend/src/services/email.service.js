import nodemailer from 'nodemailer';
import { logger } from '../utils/winstonLogger.js';

// ==================== TRANSPORT ====================

let _transporter = null;

async function getTransporter() {
  if (_transporter) return _transporter;

  if (process.env.SMTP_HOST) {
    // Production SMTP
    _transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Development: Ethereal fake SMTP
    const testAccount = await nodemailer.createTestAccount();
    _transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    logger.info('[Email] Ethereal test account oluşturuldu', { user: testAccount.user });
  }

  return _transporter;
}

// ==================== BASE SEND ====================

async function sendMail({ to, subject, html, text }) {
  const transporter = await getTransporter();

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || '"OBS Sistemi" <noreply@obs.edu.tr>',
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ''),
  });

  // Dev'de Ethereal URL
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    logger.info('[Email] Test email gönderildi', { to, subject, previewUrl });
  }

  return info;
}

// ==================== EMAIL TEMPLATES ====================

const baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f7fb; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 100%); color: white; padding: 32px 40px; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 600; }
    .header p { margin: 8px 0 0; opacity: 0.8; font-size: 14px; }
    .body { padding: 40px; color: #334155; line-height: 1.7; }
    .body h2 { color: #1e3a5f; font-size: 18px; margin-top: 0; }
    .info-box { background: #f0f4fa; border-left: 4px solid #2d5a8e; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 20px 0; }
    .btn { display: inline-block; background: #2d5a8e; color: white; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; margin-top: 16px; }
    .footer { background: #f8fafc; padding: 24px 40px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎓 OBS — Öğrenci Bilgi Sistemi</h1>
      <p>Bozok Üniversitesi Akademik Yönetim Platformu</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      Bu email otomatik olarak gönderilmiştir. Lütfen yanıtlamayınız.<br>
      © ${new Date().getFullYear()} Bozok Üniversitesi — OBS
    </div>
  </div>
</body>
</html>`;

// ==================== EMAIL SENDERS ====================

/**
 * Kayıt onaylandı emaili
 */
export async function sendRegistrationConfirmed({ to, firstName, studentNumber, departmentName }) {
  return sendMail({
    to,
    subject: '✅ Ders Kaydınız Onaylandı — OBS',
    html: baseTemplate(`
      <h2>Sayın ${firstName},</h2>
      <p>Ders kaydınız başarıyla onaylanmıştır.</p>
      <div class="info-box">
        <strong>Öğrenci No:</strong> ${studentNumber}<br>
        <strong>Bölüm:</strong> ${departmentName}<br>
        <strong>Tarih:</strong> ${new Date().toLocaleString('tr-TR')}
      </div>
      <p>OBS sistemi üzerinden kayıtlarınızı görüntüleyebilirsiniz.</p>
    `),
  });
}

/**
 * Şifre değiştirildi emaili
 */
export async function sendPasswordChanged({ to, firstName, ipAddress }) {
  return sendMail({
    to,
    subject: '🔒 Şifreniz Değiştirildi — OBS',
    html: baseTemplate(`
      <h2>Sayın ${firstName},</h2>
      <p>Hesabınızın şifresi başarıyla değiştirilmiştir.</p>
      <div class="info-box">
        <strong>Tarih:</strong> ${new Date().toLocaleString('tr-TR')}<br>
        <strong>IP Adresi:</strong> ${ipAddress || 'Bilinmiyor'}
      </div>
      <p>Bu işlemi siz yapmadıysanız, lütfen derhal sistem yöneticisine başvurunuz.</p>
    `),
  });
}

/**
 * Not açıklandı emaili
 */
export async function sendGradePublished({ to, firstName, courseName, letterGrade, academicYear }) {
  const gradeColor = ['AA', 'BA', 'BB'].includes(letterGrade) ? '#16a34a'
    : ['CB', 'CC', 'DC', 'DD'].includes(letterGrade) ? '#d97706' : '#dc2626';

  return sendMail({
    to,
    subject: `📝 Notunuz Açıklandı: ${courseName} — OBS`,
    html: baseTemplate(`
      <h2>Sayın ${firstName},</h2>
      <p><strong>${courseName}</strong> dersi notunuz sisteme işlenmiştir.</p>
      <div class="info-box">
        <strong>Ders:</strong> ${courseName}<br>
        <strong>Akademik Yıl:</strong> ${academicYear}<br>
        <strong>Harf Notu:</strong> <span style="color: ${gradeColor}; font-size: 20px; font-weight: bold;">${letterGrade}</span>
      </div>
      <p>Detaylı not bilgilerinizi OBS'den görüntüleyebilirsiniz.</p>
    `),
  });
}

/**
 * Danışman atandı emaili
 */
export async function sendAdvisorAssigned({ to, firstName, advisorName, advisorTitle }) {
  return sendMail({
    to,
    subject: '👨‍🏫 Danışmanınız Atandı — OBS',
    html: baseTemplate(`
      <h2>Sayın ${firstName},</h2>
      <p>Akademik danışmanınız sisteme tanımlanmıştır.</p>
      <div class="info-box">
        <strong>Danışman:</strong> ${advisorTitle} ${advisorName}<br>
        <strong>Tarih:</strong> ${new Date().toLocaleString('tr-TR')}
      </div>
      <p>Danışmanınızla iletişime geçmek için OBS üzerindeki mesaj sistemini kullanabilirsiniz.</p>
    `),
  });
}

/**
 * Mezuniyet tamamlandı emaili
 */
export async function sendGraduationCompleted({ to, firstName, lastName, departmentName, gpa }) {
  return sendMail({
    to,
    subject: '🎓 Tebrikler! Mezuniyetiniz Onaylandı — OBS',
    html: baseTemplate(`
      <h2>Sayın ${firstName} ${lastName},</h2>
      <p style="font-size: 16px;">🎉 <strong>Mezuniyetiniz tamamlanmıştır!</strong></p>
      <div class="info-box">
        <strong>Bölüm:</strong> ${departmentName}<br>
        <strong>Genel Not Ortalaması:</strong> ${gpa}<br>
        <strong>Mezuniyet Tarihi:</strong> ${new Date().toLocaleDateString('tr-TR')}
      </div>
      <p>Mezuniyet belgenizi öğrenci işleri biriminden teslim alabilirsiniz. Başarılarınızın devamını dileriz!</p>
    `),
  });
}

/**
 * QR Devamsızlık aktivasyon emaili
 */
export async function sendQRAttendanceActivated({ to, firstName, courseName, date }) {
  return sendMail({
    to,
    subject: `📱 QR Yoklama Başlatıldı: ${courseName} — OBS`,
    html: baseTemplate(`
      <h2>Sayın ${firstName},</h2>
      <p><strong>${courseName}</strong> dersi için QR yoklama sistemi aktif edilmiştir.</p>
      <div class="info-box">
        <strong>Ders:</strong> ${courseName}<br>
        <strong>Tarih:</strong> ${date || new Date().toLocaleDateString('tr-TR')}<br>
        <strong>Süre:</strong> 15 dakika
      </div>
      <p>Yoklamaya katılmak için OBS mobil uygulamasını açın ve QR kodu okutun.</p>
    `),
  });
}
