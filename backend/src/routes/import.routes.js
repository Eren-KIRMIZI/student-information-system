import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { importStudentsFromCSV } from '../services/import.service.js';
import { AppError } from '../utils/appError.util.js';

const router = Router();

// CSV upload — sadece bellekte tut (disk'e yazma)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new AppError('Sadece CSV dosyası yüklenebilir', 400));
    }
  },
});

router.use(authenticate, authorize('ADMIN'));

/**
 * @swagger
 * /api/v1/import/students:
 *   post:
 *     tags: [Import]
 *     summary: CSV ile toplu öğrenci ekle
 *     description: |
 *       CSV formatı (başlık satırı zorunlu):
 *       ```
 *       studentNumber,firstName,lastName,nationalId,email,phone,birthDate,classYear,departmentCode
 *       2024000001,Ahmet,Yılmaz,12345678901,ahmet@ogrenci.obs.edu.tr,5551234567,2000-05-15,1,CS
 *       ```
 *
 *       **Notlar:**
 *       - Varsayılan şifre: `Student123!`
 *       - Zaten var olan kayıtlar (email/TC/öğrenci no) atlanır
 *       - Maksimum dosya boyutu: 5MB
 *       - birthDate formatı: YYYY-MM-DD
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: CSV dosyası
 *     responses:
 *       200:
 *         description: İçe aktarma tamamlandı
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:    { type: integer, example: 100 }
 *                     imported: { type: integer, example: 95 }
 *                     skipped:  { type: integer, example: 5 }
 *                     errors:   { type: array }
 *       400:
 *         description: Geçersiz dosya veya format hatası
 *       403:
 *         description: Yetersiz yetki
 */
router.post('/students', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('CSV dosyası gereklidir', 400));
    }

    const results = await importStudentsFromCSV(req.file.buffer, null);

    return res.status(200).json({
      success: true,
      message: `İçe aktarma tamamlandı: ${results.imported}/${results.total} kayıt eklendi`,
      data: results,
    });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
});

/**
 * @swagger
 * /api/v1/import/template:
 *   get:
 *     tags: [Import]
 *     summary: CSV şablon dosyasını indir
 *     description: Toplu öğrenci ekleme için boş CSV şablonu indirir
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV şablon dosyası
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 */
router.get('/template', (_req, res) => {
  const headers = 'studentNumber,firstName,lastName,nationalId,email,phone,birthDate,classYear,departmentCode\n';
  const example = '2024000001,Ahmet,Yılmaz,12345678901,ahmet@ogrenci.obs.edu.tr,5551234567,2000-05-15,1,CS\n';
  const example2 = '2024000002,Zeynep,Kaya,98765432100,zeynep@ogrenci.obs.edu.tr,5559876543,2001-03-20,1,EE\n';

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="ogrenci-sablon.csv"');
  res.send('\uFEFF' + headers + example + example2); // BOM for Excel Turkish chars
});

export default router;
