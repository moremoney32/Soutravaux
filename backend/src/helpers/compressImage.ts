import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

/**
 * Compresse une image avec Sharp
 * @param srcPath Chemin source de l'image
 * @returns Chemin de l'image compressée
 */
async function compressImage(srcPath: string): Promise<string> {
  try {
    const ext = path.extname(srcPath);
    const dstPath = srcPath.replace(ext, `.min${ext}`);

    await sharp(srcPath)
      .resize({ width: 1920, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toFile(dstPath);

    // Supprimer l'original
    fs.unlinkSync(srcPath);
    
    console.log(`✅ Image compressée: ${path.basename(dstPath)}`);
    return dstPath;
  } catch (err) {
    console.error("❌ Erreur compression image:", err);
    throw new Error("Échec de la compression de l'image");
  }
}

export default compressImage;