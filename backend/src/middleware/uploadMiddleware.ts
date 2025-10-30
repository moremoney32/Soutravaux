import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import checkMagicNumbers from '../helpers/checkMagicNumbers';
import compressImage from '../helpers/compressImage';

// Configuration du stockage Multer
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(__dirname, '../../public/uploads/images');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${file.fieldname}${ext}`;
    cb(null, uniqueName);
  }
});

//Configuration Multer
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Max 10 Mo
  },
  fileFilter: (_req, file, cb) => {
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    
    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé. Utilisez JPEG, PNG ou WEBP.'));
    }
  }
});

//Middleware principal
async function handleImageUpload(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await upload.single('image')(req, res, async (err: any) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          res.status(413).json({ 
            success: false,
            error: "Image trop volumineuse (max 10MB)" 
          });
          return;
        }
        res.status(400).json({ 
          success: false,
          error: err.message 
        });
        return;
      }
      
      if (!req.file) {
        res.status(400).json({ 
          success: false,
          error: "Aucune image fournie" 
        });
        return;
      }
      
      let filePath = req.file.path;
      const mimeType = req.file.mimetype;
      const fileSize = req.file.size;
      
      //Vérification de la signature magique
      const isValid = checkMagicNumbers(filePath, mimeType);
      if (!isValid) {
        fs.unlinkSync(filePath);
        res.status(415).json({ 
          success: false,
          error: "Signature de fichier invalide. Le fichier peut être corrompu ou falsifié" 
        });
        return;
      }

      //Compression si nécessaire (> 5 Mo)
      const COMPRESS_THRESHOLD = 5 * 1024 * 1024;
      if (fileSize > COMPRESS_THRESHOLD) {
        try {
          filePath = await compressImage(filePath);
        } catch (compressError) {
          if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }
          res.status(500).json({ 
            success: false,
            error: "Échec de la compression de l'image" 
          });
          return;
        }
      }

      //Générer l'URL publique
      const fileName = path.basename(filePath);
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://solutravo.zeta-app.fr'
        : 'http://localhost:3000';
      
      const url = `${baseUrl}/uploads/images/${fileName}`;
      
      //Stocker l'URL dans la requête pour le controller
      (req as any).fileUrl = url;
      
      console.log(`Image uploadée: ${url}`);
      next();
    });
  } catch (e) {
    next(e);
  }
}

export default handleImageUpload;