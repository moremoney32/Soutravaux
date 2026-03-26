



import { Eye } from 'lucide-react';
import type { Product } from '../data/mockDataPrice';
import { getProductImageUrl } from '../helpers/BaseFileUrl';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

export const ProductCard = ({ product, onAdd, onViewDetails }: ProductCardProps) => {
  const imageUrl = getProductImageUrl(product.imageUrl);

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

      {/* DEBUG : affiche l'image brute sans fallback pour diagnostiquer */}
      <div className="price-request-product-image">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            onError={() => console.error(`❌ PRODUIT image cassée: ${imageUrl}`)}
            onLoad={() => console.log(`✅ PRODUIT image OK: ${imageUrl}`)}
          />
        ) : (
          <span style={{ fontSize: 11, color: '#999' }}>⚠️ Pas d'image ({product.imageUrl})</span>
        )}
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