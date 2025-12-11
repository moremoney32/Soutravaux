"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const buffer_1 = require("buffer");
/**
 * Vérifie la signature magique d'un fichier image
 * @param filePath Chemin du fichier
 * @param expectedType Type MIME attendu
 * @returns true si la signature correspond
 */
function checkMagicNumbers(filePath, expectedType) {
    try {
        const buffer = fs_1.default.readFileSync(filePath, { flag: 'r' });
        const first12Bytes = buffer.slice(0, 12);
        const signatures = {
            'image/jpeg': [buffer_1.Buffer.from([0xFF, 0xD8, 0xFF])],
            'image/png': [buffer_1.Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])],
            'image/webp': [buffer_1.Buffer.from([0x52, 0x49, 0x46, 0x46])], // RIFF (début)
        };
        const expectedSignatures = signatures[expectedType];
        if (!expectedSignatures) {
            console.warn(`Type MIME non reconnu: ${expectedType}`);
            return false;
        }
        return expectedSignatures.some(sig => first12Bytes.slice(0, sig.length).equals(sig));
    }
    catch (err) {
        console.error("Erreur de vérification de signature:", err);
        return false;
    }
}
exports.default = checkMagicNumbers;
//# sourceMappingURL=checkMagicNumbers.js.map