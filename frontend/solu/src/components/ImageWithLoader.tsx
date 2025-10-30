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

  if (!src || error) {
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
        src={src}
        alt={alt}
        className={`image-content ${loading ? 'loading' : 'loaded'}`}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
      />
    </div>
  );
};

export default ImageWithLoader;