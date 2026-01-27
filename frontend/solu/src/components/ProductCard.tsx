
import { Eye, Package } from 'lucide-react';
import type { Product } from '../data/mockDataPrice';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

export const ProductCard = ({ product, onAdd, onViewDetails }: ProductCardProps) => {
  return (
    <div className="price-request-product-card">
      <div className="price-request-product-header">
        <div>
          <h4 className="price-request-product-name">{product.name}</h4>
          <p className="price-request-product-reference">{product.reference}</p>
        </div>
        <button
          className="price-request-icon-button"
          onClick={() => onViewDetails(product)}
          title="Voir les détails"
        >
          <Eye size={20} />
        </button>
      </div>

      <div className="price-request-product-image">
        <Package size={60} color="#E0E0E0" />
      </div>

      <p className="price-request-product-description">{product.description}</p>

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
