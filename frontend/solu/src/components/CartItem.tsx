import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import type { PriceRequestItem } from '../data/mockDataPrice';

interface CartItemProps {
  item: PriceRequestItem;
  totalItems: number;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onUpdateNote: (productId: string, note: string) => void;
  onUpdateReference: (productId: string, reference: string) => void;
  onRemove: (productId: string) => void;
}

export const CartItem = ({ 
  item, 
  totalItems, 
  isExpanded,
  onToggle,
  onUpdateQuantity, 
  onUpdateNote, 
  onUpdateReference,
  onRemove 
}: CartItemProps) => {
  return (
    <div className="price-request-cart-item">
      <div className="price-request-cart-item-header">
        <div className="price-request-cart-item-info">
          <h5 className="price-request-cart-item-name">{item.product.name}</h5>
        </div>
        <div className="price-request-cart-item-actions">
          {totalItems > 1 && (
            <button
              className="price-request-toggle-button"
              onClick={onToggle}
              title={isExpanded ? 'Replier' : 'Dérouler'}
            >
              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          )}
          <button
            className="price-request-remove-button"
            onClick={() => onRemove(item.product.id)}
            title="Retirer"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="price-request-cart-item-details">
          <div className="price-request-detail-field">
            <label className="price-request-detail-label">Référence:</label>
            <input
              type="text"
              value={item.reference || item.product.reference}
              onChange={(e) => onUpdateReference(item.product.id, e.target.value)}
              className="price-request-form-input"
              required
            />
          </div>

          <div className="price-request-quantity-control">
            <label className="price-request-quantity-label">Quantité:</label>
            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) => onUpdateQuantity(item.product.id, parseInt(e.target.value) || 1)}
              className="price-request-quantity-input"
            />
          </div>

          <div>
            <label className="price-request-note-label">Note/Consigne:</label>
            <textarea
              value={item.note}
              onChange={(e) => onUpdateNote(item.product.id, e.target.value)}
              className="price-request-note-input"
              placeholder="Ajouter une note..."
            />
          </div>

        </div>
      )}
    </div>
  );
};
