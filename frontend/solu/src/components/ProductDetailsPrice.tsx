

// import { useState } from 'react';
// import { X, Package } from 'lucide-react';
// import type { Product } from '../data/mockDataPrice';
// import { getProductImageUrl } from '../helpers/BaseFileUrl';

// interface ProductDetailModalProps {
//   product: Product | null;
//   onClose: () => void;
// }

// export const ProductDetailModal = ({ product, onClose }: ProductDetailModalProps) => {
//   const [imageError, setImageError] = useState(false);
  
//   if (!product) return null;

//   const imageUrl = getProductImageUrl(product.imageUrl);

//   return (
//     <div className="price-request-modal-overlay" onClick={onClose}>
//       <div className="price-request-modal" onClick={(e) => e.stopPropagation()}>
//         <div className="price-request-modal-header">
//           <h3 className="price-request-modal-title">Détail du produit</h3>
//           <button className="price-request-modal-close" onClick={onClose}>
//             <X size={24} />
//           </button>
//         </div>
        
//         <div className="price-request-modal-content">
//           {/* Image du produit */}
//           <div className="price-request-modal-image">
//             {imageUrl && !imageError ? (
//               <img 
//                 src={imageUrl} 
//                 alt={product.name}
//                 style={{
//                   width: '100%',
//                   maxHeight: '300px',
//                   objectFit: 'cover',
//                   borderRadius: '8px'
//                 }}
//                 onError={() => {
//                   console.error(`❌ Image non trouvée: ${imageUrl}`);
//                   setImageError(true);
//                 }}
//               />
//             ) : (
//               <Package size={80} color="#E0E0E0" />
//             )}
//           </div>

//           {/* Nom du produit */}
//           <div className="price-request-modal-info">
//             <div className="price-request-modal-label">Nom du produit</div>
//             <p className="price-request-modal-value">{product.name}</p>
//           </div>

//           {/* Référence */}
//           <div className="price-request-modal-info">
//             <div className="price-request-modal-label">Référence</div>
//             <p className="price-request-modal-value">{product.reference}</p>
//           </div>

//           {/* Famille */}
//           {product.familyId && (
//             <div className="price-request-modal-info">
//               <div className="price-request-modal-label">Famille</div>
//               <p className="price-request-modal-value">{product.familyId}</p>
//             </div>
//           )}

//           {/* Unité */}
//           {product.unit && (
//             <div className="price-request-modal-info">
//               <div className="price-request-modal-label">Unité</div>
//               <p className="price-request-modal-value">{product.unit}</p>
//             </div>
//           )}

//           {/* Description */}
//           <div className="price-request-modal-info">
//             <div className="price-request-modal-label">Description</div>
//             <p className="price-request-modal-value">
//               {product.description || 'Aucune description disponible'}
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };


// import { useState } from 'react';
// import { X } from 'lucide-react';
// import type { Product } from '../data/mockDataPrice';
// import { getProductImageUrl } from '../helpers/BaseFileUrl';
// import placeholderImage from '../assets/images/placeholder.png';

// interface ProductDetailModalProps {
//   product: Product | null;
//   onClose: () => void;
// }

// export const ProductDetailModal = ({ product, onClose }: ProductDetailModalProps) => {
//   const [imageError, setImageError] = useState(false);
  
//   if (!product) return null;

//   const imageUrl = getProductImageUrl(product.imageUrl);
  
//   // ✅ Utiliser l'image du serveur si disponible, sinon placeholder local
//   const displayImage = (imageUrl && !imageError) ? imageUrl : placeholderImage;

//   return (
//     <div className="price-request-modal-overlay" onClick={onClose}>
//       <div className="price-request-modal" onClick={(e) => e.stopPropagation()}>
//         <div className="price-request-modal-header">
//           <h3 className="price-request-modal-title">Détail du produit</h3>
//           <button className="price-request-modal-close" onClick={onClose}>
//             <X size={24} />
//           </button>
//         </div>
        
//         <div className="price-request-modal-content">
//           {/* ✅ Image du produit (toujours affichée) */}
//           <div className="price-request-modal-image">
//             <img 
//               src={displayImage}
//               alt={product.name}
//               style={{
//                 width: '100%',
//                 maxHeight: '400px',
//                 objectFit: 'contain',
//                 borderRadius: '8px',
//                 background: '#f5f5f5'
//               }}
//               onError={() => {
//                 if (imageUrl) {
//                   console.error(`❌ Image serveur non trouvée: ${imageUrl}`);
//                   setImageError(true);
//                 }
//               }}
//             />
//           </div>

//           {/* Nom du produit */}
//           <div className="price-request-modal-info">
//             <div className="price-request-modal-label">Nom du produit</div>
//             <p className="price-request-modal-value">{product.name}</p>
//           </div>

//           {/* Référence */}
//           <div className="price-request-modal-info">
//             <div className="price-request-modal-label">Référence</div>
//             <p className="price-request-modal-value">{product.reference}</p>
//           </div>

//           {/* Famille */}
//           {product.familyId && (
//             <div className="price-request-modal-info">
//               <div className="price-request-modal-label">Famille</div>
//               <p className="price-request-modal-value">{product.familyId}</p>
//             </div>
//           )}

//           {/* Unité */}
//           {product.unit && (
//             <div className="price-request-modal-info">
//               <div className="price-request-modal-label">Unité</div>
//               <p className="price-request-modal-value">{product.unit}</p>
//             </div>
//           )}

//           {/* Description */}
//           <div className="price-request-modal-info">
//             <div className="price-request-modal-label">Description</div>
//             <p className="price-request-modal-value" style={{ whiteSpace: 'pre-line' }}>
//               {product.description || 'Aucune description disponible'}
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };


import { useState } from 'react';
import { X } from 'lucide-react';
import type { Product } from '../data/mockDataPrice';
import { getProductImageUrl } from '../helpers/BaseFileUrl';
import placeholderImage from '../assets/images/placeholder.png';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal = ({ product, onClose }: ProductDetailModalProps) => {
  const [imageError, setImageError] = useState(false);
  
  if (!product) return null;

  const imageUrl = getProductImageUrl(product.imageUrl);
  const displayImage = (imageUrl && !imageError) ? imageUrl : placeholderImage;

  return (
    <div className="price-request-modal-overlay" onClick={onClose}>
      <div className="price-request-modal" onClick={(e) => e.stopPropagation()}>
        <div className="price-request-modal-header">
          <h3 className="price-request-modal-title">Détail du produit</h3>
          <button className="price-request-modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className="price-request-modal-content">
          {/* ✅ IMAGE OPTIMISÉE */}
          <div className="price-request-modal-image">
            <img 
              src={displayImage}
              alt={product.name}
              onError={() => {
                if (imageUrl) {
                  console.error(`❌ Image non trouvée: ${imageUrl}`);
                  setImageError(true);
                }
              }}
            />
          </div>

          {/* Nom du produit */}
          <div className="price-request-modal-info">
            <div className="price-request-modal-label">Nom du produit</div>
            <p className="price-request-modal-value">{product.name}</p>
          </div>

          {/* Référence */}
          <div className="price-request-modal-info">
            <div className="price-request-modal-label">Référence</div>
            <p className="price-request-modal-value">{product.reference}</p>
          </div>

          {/* Famille */}
          {product.familyId && (
            <div className="price-request-modal-info">
              <div className="price-request-modal-label">Famille</div>
              <p className="price-request-modal-value">{product.familyId}</p>
            </div>
          )}

          {/* Unité */}
          {product.unit && (
            <div className="price-request-modal-info">
              <div className="price-request-modal-label">Unité</div>
              <p className="price-request-modal-value">{product.unit}</p>
            </div>
          )}

          {/* Description */}
          <div className="price-request-modal-info">
            <div className="price-request-modal-label">Description</div>
            <p className="price-request-modal-value" style={{ whiteSpace: 'pre-line' }}>
              {product.description || 'Aucune description disponible'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};