"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sharp_1 = __importDefault(require("sharp"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * Compresse une image avec Sharp
 * @param srcPath Chemin source de l'image
 * @returns Chemin de l'image compressée
 */
async function compressImage(srcPath) {
    try {
        const ext = path_1.default.extname(srcPath);
        const dstPath = srcPath.replace(ext, `.min${ext}`);
        await (0, sharp_1.default)(srcPath)
            .resize({ width: 1920, withoutEnlargement: true })
            .jpeg({ quality: 80 })
            .toFile(dstPath);
        // Supprimer l'original
        fs_1.default.unlinkSync(srcPath);
        console.log(`✅ Image compressée: ${path_1.default.basename(dstPath)}`);
        return dstPath;
    }
    catch (err) {
        console.error("❌ Erreur compression image:", err);
        throw new Error("Échec de la compression de l'image");
    }
}
exports.default = compressImage;
//# sourceMappingURL=compressImage.js.map