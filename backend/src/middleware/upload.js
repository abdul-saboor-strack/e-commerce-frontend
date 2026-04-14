import fs from "fs";
import path from "path";
import multer from "multer";

// Ensure uploads folder exists
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safe}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// For multiple images (up to 10)
export const uploadMultiple = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
}).array('images', 10); // Field name 'images', max 10 files
