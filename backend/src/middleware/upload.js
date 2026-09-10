const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const UPLOADS_DIR = path.join(__dirname, '../../uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const nombre = path.basename(file.originalname, ext)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const sufijo = crypto.randomBytes(4).toString('hex');
    cb(null, `${nombre}-${sufijo}${ext}`);
  }
});

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.pdf' || ext === '.epub') {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF o EPUB'));
  }
}

module.exports = multer({
  storage,
  limits: { fileSize: 80 * 1024 * 1024 },
  fileFilter
});