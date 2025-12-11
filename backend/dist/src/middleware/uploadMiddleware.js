"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const checkMagicNumbers_1 = __importDefault(require("../helpers/checkMagicNumbers"));
const compressImage_1 = __importDefault(require("../helpers/compressImage"));
// Configuration du stockage Multer
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        const dir = path_1.default.join(__dirname, '../../public/uploads/images');
        fs_1.default.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        const uniqueName = `${Date.now()}-${file.fieldname}${ext}`;
        cb(null, uniqueName);
    }
});
//Configuration Multer
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // Max 10 Mo
    },
    fileFilter: (_req, file, cb) => {
        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowedImageTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Type de fichier non autorisé. Utilisez JPEG, PNG ou WEBP.'));
        }
    }
});
//Middleware principal
async function handleImageUpload(req, res, next) {
    try {
        await upload.single('image')(req, res, async (err) => {
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
            const isValid = (0, checkMagicNumbers_1.default)(filePath, mimeType);
            if (!isValid) {
                fs_1.default.unlinkSync(filePath);
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
                    filePath = await (0, compressImage_1.default)(filePath);
                }
                catch (compressError) {
                    if (fs_1.default.existsSync(req.file.path)) {
                        fs_1.default.unlinkSync(req.file.path);
                    }
                    res.status(500).json({
                        success: false,
                        error: "Échec de la compression de l'image"
                    });
                    return;
                }
            }
            //Générer l'URL publique
            const fileName = path_1.default.basename(filePath);
            //   const baseUrl = process.env.NODE_ENV === 'production' 
            //     ? 'https://solutravo.zeta-app.fr'
            //     : 'http://localhost:3000';
            // const baseUrl = process.env.APP_URL || 'https://solutravo.zeta-app.fr';
            const baseUrl = process.env.APP_URL || 'https://staging.solutravo.zeta-app.fr';
            const url = `${baseUrl}/uploads/images/${fileName}`;
            //Stocker l'URL dans la requête pour le controller
            req.fileUrl = url;
            console.log(`Image uploadée: ${url}`);
            next();
        });
    }
    catch (e) {
        next(e);
    }
}
exports.default = handleImageUpload;
//# sourceMappingURL=uploadMiddleware.js.map