import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer to use memory storage so the file is stored in-memory as a Buffer in `req.file.buffer`
const storage = multer.memoryStorage();

const upload = multer({ storage });

export default upload;
