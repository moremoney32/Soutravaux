
import { X, Package } from 'lucide-react';
import type { Product } from '../data/mockDataPrice';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal = ({ product, onClose }: ProductDetailModalProps) => {
  if (!product) return null;

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
          <div className="price-request-modal-image">
            <Package size={80} color="#E0E0E0" />
          </div>

          <div className="price-request-modal-info">
            <div className="price-request-modal-label">Nom du produit</div>
            <p className="price-request-modal-value">{product.name}</p>
          </div>

          <div className="price-request-modal-info">
            <div className="price-request-modal-label">Référence</div>
            <p className="price-request-modal-value">{product.reference}</p>
          </div>

          <div className="price-request-modal-info">
            <div className="price-request-modal-label">Unité</div>
            <p className="price-request-modal-value">{product.unit}</p>
          </div>

          <div className="price-request-modal-info">
            <div className="price-request-modal-label">Description</div>
            <p className="price-request-modal-value">{product.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
