// ✅ URLs DE BASE POUR LES IMAGES ET DOCUMENTS
export const BASE_IMAGE_URL = 'https://laravel-api.solutravo-compta.fr/storage/LibraryImages/';
//  export const BASE_PRODUCT_IMAGE_URL = 'https://laravel-api.solutravo-compta.fr/storage/ProductImages/';
// export const BASE_PRODUCT_DOC_URL = 'https://laravel-api.solutravo-compta.fr/storage/ProductDocumentations/'
  export const BASE_PRODUCT_IMAGE_URL = 'https://staging.solutravo-compta.fr/public//uploads/catalogue/image/'

/**
 * Construit l'URL complète d'une image produit
 */
export const getProductImageUrl = (imagePath: string | undefined | null): string | null => {
  if (!imagePath) return null;

  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  let cleanPath = imagePath.trim();

  const prefixesToRemove = [
    'storage/ProductImages/',
    'ProductImages/',
    'public/ProductImages/',
    'public/storage/ProductImages/'
  ];

  prefixesToRemove.forEach(prefix => {
    if (cleanPath.startsWith(prefix)) {
      cleanPath = cleanPath.substring(prefix.length);
    }
  });

  return `${BASE_PRODUCT_IMAGE_URL}${cleanPath}`;
};

/**
 * Construit l'URL complète d'une image de bibliothèque
 */
export const getLibraryImageUrl = (imagePath: string | undefined | null): string | null => {
  if (!imagePath) return null;

  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  let cleanPath = imagePath.trim();

  const prefixesToRemove = [
    'storage/LibraryImages/',
    'LibraryImages/',
    'public/LibraryImages/',
    'public/storage/LibraryImages/'
  ];

  prefixesToRemove.forEach(prefix => {
    if (cleanPath.startsWith(prefix)) {
      cleanPath = cleanPath.substring(prefix.length);
    }
  });

  return `${BASE_IMAGE_URL}${cleanPath}`;
};