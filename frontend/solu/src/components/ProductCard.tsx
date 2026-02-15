


// import { useState } from 'react';
// import { Eye } from 'lucide-react';
// import type { Product } from '../data/mockDataPrice';
// import { getProductImageUrl } from '../helpers/BaseFileUrl';
// import placeholderImage from '../assets/images/placeholder.png';

// interface ProductCardProps {
//   product: Product;
//   onAdd: (product: Product) => void;
//   onViewDetails: (product: Product) => void;
// }

// export const ProductCard = ({ product, onAdd, onViewDetails }: ProductCardProps) => {
//   const [imageError, setImageError] = useState(false);
//   const imageUrl = getProductImageUrl(product.imageUrl);
  
//   // ✅ Utiliser l'image du serveur si disponible, sinon placeholder local
//   const displayImage = (imageUrl && !imageError) ? imageUrl : placeholderImage;

//   return (
//     <div className="price-request-product-card">
//       <div className="price-request-product-header">
//         <div>
//           <h4 className="price-request-product-name">{product.name}</h4>
//           <p className="price-request-product-reference">Réf: {product.reference}</p>
//         </div>
//         <button
//           className="price-request-icon-button"
//           onClick={() => onViewDetails(product)}
//           title="Voir les détails"
//         >
//           <Eye size={20} />
//         </button>
//       </div>

//       <div className="price-request-product-image">
//         <img 
//           src={displayImage}
//           alt={product.name}
//           style={{
//             width: '100%',
//             height: '100%',
//             objectFit: 'cover',
//             borderRadius: '8px'
//           }}
//           onError={() => {
//             if (imageUrl) {
//               console.error(`❌ Image serveur non trouvée: ${imageUrl}`);
//               setImageError(true);
//             }
//           }}
//         />
//       </div>

//       <p className="price-request-product-description">
//         {product.description || product.familyId}
//       </p>

//       <button
//         className="price-request-add-button"
//         onClick={() => onAdd(product)}
//         title="Ajouter à la demande"
//       >
//         +
//       </button>
//     </div>
//   );
// };



import { useState } from 'react';
import { Eye } from 'lucide-react';
import type { Product } from '../data/mockDataPrice';
import { getProductImageUrl } from '../helpers/BaseFileUrl';
import placeholderImage from '../assets/images/placeholder.png';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

export const ProductCard = ({ product, onAdd, onViewDetails }: ProductCardProps) => {
  const [imageError, setImageError] = useState(false);
  const imageUrl = getProductImageUrl(product.imageUrl);
  
  // ✅ Utiliser l'image du serveur si disponible, sinon placeholder local
  const displayImage = (imageUrl && !imageError) ? imageUrl : placeholderImage;

  return (
    <div className="price-request-product-card">
      {/* ✅ Header : NOM + bouton œil (PAS de ref) */}
      <div className="price-request-product-header">
        <h4 className="price-request-product-name">{product.name}</h4>
        <button
          className="price-request-icon-button"
          onClick={() => onViewDetails(product)}
          title="Voir les détails"
        >
          <Eye size={18} />
        </button>
      </div>

      {/* ✅ Image produit : hauteur fixe 80px */}
      <div className="price-request-product-image">
        <img 
          src={displayImage}
          alt={product.name}
          onError={() => {
            if (imageUrl) {
              console.error(`❌ Image serveur non trouvée: ${imageUrl}`);
              setImageError(true);
            }
          }}
        />
      </div>

      {/* ✅ PAS de ref, PAS de description affichée */}

      {/* ✅ Bouton + en bas */}
      <button
        className="price-request-add-button"
        onClick={() => onAdd(product)}
        title="Ajouter à la demande"
      >
        +
      </button>
    </div>
  );
};