import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp',   'image/heic', 'image/heif',];

  if (tiposPermitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato de imagem inválido. Use JPEG, PNG ou WebP.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});