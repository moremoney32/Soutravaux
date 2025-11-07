// import { useState } from 'react';
// import "../styles/ImageWithLoader.css"

// interface ImageWithLoaderProps {
//   src: string | null | undefined;
//   alt: string;
//   className?: string;
//   fallbackIcon?: string;
// }

// const ImageWithLoader = ({ 
//   src, 
//   alt, 
//   className = '', 
//   fallbackIcon = 'fa-image' 
// }: ImageWithLoaderProps) => {
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(false);

//   if (!src || error) {
//     return (
//       <div className={`image-placeholder ${className}`}>
//         <i className={`fa-solid ${fallbackIcon}`}></i>
//         <span>Aucune image</span>
//       </div>
//     );
//   }

//   return (
//     <div className={`image-wrapper ${className}`}>
//       {loading && (
//         <div className="image-loader">
//           <i className="fa-solid fa-spinner fa-spin"></i>
//           <span>Chargement...</span>
//         </div>
//       )}
//       <img
//         src={src}
//         alt={alt}
//         className={`image-content ${loading ? 'loading' : 'loaded'}`}
//         onLoad={() => setLoading(false)}
//         onError={() => {
//           setLoading(false);
//           setError(true);
//         }}
//       />
//     </div>
//   );
// };

// export default ImageWithLoader;


import { useState } from 'react';
import "../styles/ImageWithLoader.css"

interface ImageWithLoaderProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallbackIcon?: string;
}

const ImageWithLoader = ({ 
  src, 
  alt, 
  className = '', 
  fallbackIcon = 'fa-image' 
}: ImageWithLoaderProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // ✅ FONCTION POUR NORMALISER L'URL
  const getNormalizedUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    
    // Si l'URL contient localhost, la remplacer
    if (url.includes('localhost')) {
      const correctedUrl = url.replace(/http:\/\/localhost:\d+/, 'https://staging.solutravo.zeta-app.fr');
      console.log('🔧 URL corrigée:', url, '→', correctedUrl);
      return correctedUrl;
    }
    
    // Si l'URL est relative (commence par /), la rendre absolue
    if (url.startsWith('/uploads')) {
      const absoluteUrl = `https://staging.solutravo.zeta-app.fr${url}`;
      console.log('🔧 URL relative convertie:', url, '→', absoluteUrl);
      return absoluteUrl;
    }
    
    // Si l'URL est déjà correcte, la retourner telle quelle
    return url;
  };

  const normalizedSrc = getNormalizedUrl(src);

  if (!normalizedSrc || error) {
    return (
      <div className={`image-placeholder ${className}`}>
        <i className={`fa-solid ${fallbackIcon}`}></i>
        <span>Aucune image</span>
      </div>
    );
  }

  return (
    <div className={`image-wrapper ${className}`}>
      {loading && (
        <div className="image-loader">
          <i className="fa-solid fa-spinner fa-spin"></i>
          <span>Chargement...</span>
        </div>
      )}
      <img
        src={normalizedSrc}
        alt={alt}
        className={`image-content ${loading ? 'loading' : 'loaded'}`}
        onLoad={() => {
          console.log('✅ Image chargée:', normalizedSrc);
          setLoading(false);
        }}
        onError={() => {
          console.error('❌ Erreur chargement image:', normalizedSrc);
          setLoading(false);
          setError(true);
        }}
      />
    </div>
  );
};

export default ImageWithLoader;