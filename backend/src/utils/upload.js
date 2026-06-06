import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadsDir = path.resolve(
  process.cwd(),
  'uploads'
);

// Create uploads directory if missing
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, {
    recursive: true,
  });
}

// Allowed image MIME types
const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg',
];

// Storage configuration
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadsDir);
  },

  filename(req, file, cb) {
    const uniqueSuffix =
      `${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}`;

    const ext =
      path.extname(file.originalname)
        .toLowerCase();

    cb(
      null,
      `poster-${uniqueSuffix}${ext}`
    );
  },
});

// File filter
function fileFilter(req, file, cb) {
  if (
    !allowedMimeTypes.includes(
      file.mimetype
    )
  ) {
    return cb(
      new Error(
        'Only JPG, JPEG, PNG, and WEBP files are allowed'
      )
    );
  }

  cb(null, true);
}

export const upload = multer({
  storage,

  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

export default upload;


