import { NextFunction, Request, Response, Router } from "express";
import multer from "multer";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { requireAuth, AuthedRequest } from "../middleware/auth";

const router = Router();

const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TO_EXT[file.mimetype]) {
      return cb(new Error("Unsupported image type"));
    }
    cb(null, true);
  },
});

// Stores the uploaded file under a random filename (never the client-supplied
// name) so there's no path-traversal or collision risk, and returns a public
// URL. The rest of the app already treats a headshot/project image/avatar as
// "just a URL string", so this is the only piece needed to support uploads —
// nothing downstream (templates, export, preview) needs to change.
router.post("/image", requireAuth, upload.single("image"), (req: AuthedRequest, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image file provided" });
  }

  const ext = ALLOWED_MIME_TO_EXT[req.file.mimetype];
  const filename = `${crypto.randomUUID()}.${ext}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, filename), req.file.buffer);

  const baseUrl = process.env.PUBLIC_SERVER_URL || `${req.protocol}://${req.get("host")}`;
  res.status(201).json({ url: `${baseUrl}/uploads/${filename}` });
});

// Multer's fileFilter/limits errors land here rather than throwing past the
// route, so surface them as 400s instead of a generic 500.
router.use((err: any, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError || err) {
    return res.status(400).json({ error: err.message || "Upload failed" });
  }
  next();
});

export { UPLOAD_DIR };
export default router;
