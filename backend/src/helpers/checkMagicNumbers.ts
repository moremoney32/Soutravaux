import fs from 'fs';
import { Buffer } from 'buffer';

/**
 * Vérifie la signature magique d'un fichier image
 * @param filePath Chemin du fichier
 * @param expectedType Type MIME attendu
 * @returns true si la signature correspond
 */
function checkMagicNumbers(filePath: string, expectedType: string): boolean {
  try {
    const buffer = fs.readFileSync(filePath, { flag: 'r' });
    const first12Bytes = buffer.slice(0, 12);
    
    const signatures: { [key: string]: Buffer[] } = {
      'image/jpeg': [Buffer.from([0xFF, 0xD8, 0xFF])],
      'image/png': [Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])],
      'image/webp': [Buffer.from([0x52, 0x49, 0x46, 0x46])], // RIFF (début)
    };

    const expectedSignatures = signatures[expectedType];
    if (!expectedSignatures) {
      console.warn(`Type MIME non reconnu: ${expectedType}`);
      return false;
    }

    return expectedSignatures.some(sig => 
      first12Bytes.slice(0, sig.length).equals(sig)
    );
  } catch (err) {
    console.error("Erreur de vérification de signature:", err);
    return false;
  }
}

export default checkMagicNumbers;