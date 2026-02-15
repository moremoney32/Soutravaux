

// import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
// import type { PriceRequestItem } from '../data/mockDataPrice';

// interface CartItemProps {
//   item: PriceRequestItem;
//   totalItems: number;
//   isExpanded: boolean;
//   onToggle: () => void;
//   onUpdateQuantity: (productId: string, quantity: number) => void;
//   onUpdateNote: (productId: string, note: string) => void;
//   onRemove: (productId: string) => void;
// }

// export const CartItem = ({
//   item,
//   isExpanded,
//   onToggle,
//   onUpdateQuantity,
//   onUpdateNote,
//   onRemove
// }: CartItemProps) => {
//   return (
//     <div className="price-request-cart-item">

//       {/* ── Header : nom + badge qté + actions ── */}
//       <div className="price-request-cart-item-header">
//         <div className="price-request-cart-item-info">
//           <h5 className="price-request-cart-item-name" title={item.product.name}>
//             {item.product.name}
//           </h5>
//           <span className="price-request-cart-item-qty-badge">
//             {item.quantity}{item.product.unit ? ` ${item.product.unit}` : ''}
//           </span>
//         </div>

//         <div className="price-request-cart-item-actions">
//           <button
//             className="price-request-toggle-button"
//             onClick={onToggle}
//             title={isExpanded ? 'Replier' : 'Modifier'}
//           >
//             {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
//           </button>
//           <button
//             className="price-request-remove-button"
//             onClick={() => onRemove(item.product.id)}
//             title="Retirer"
//           >
//             <Trash2 size={15} />
//           </button>
//         </div>
//       </div>

//       {/* ── Détails dépliables ── */}
//       {isExpanded && (
//         <div className="price-request-cart-item-details">

//           {/* Quantité */}
//           <div className="price-request-quantity-control">
//             <label className="price-request-quantity-label">Quantité :</label>
//             <input
//               type="number"
//               min="1"
//               value={item.quantity}
//               onChange={e => onUpdateQuantity(item.product.id, Math.max(1, parseInt(e.target.value) || 1))}
//               className="price-request-quantity-input"
//             />
//             {item.product.unit && (
//               <span style={{ fontSize: 11, color: '#888' }}>{item.product.unit}</span>
//             )}
//           </div>

//           {/* Note / consigne */}
//           <div>
//             <label className="price-request-note-label">Note / Consigne</label>
//             <textarea
//               value={item.note}
//               onChange={e => onUpdateNote(item.product.id, e.target.value)}
//               className="price-request-note-input"
//               placeholder="Instructions particulières pour ce produit..."
//             />
//           </div>

//         </div>
//       )}
//     </div>
//   );
// };



import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import type { PriceRequestItem } from '../data/mockDataPrice';

interface CartItemProps {
  item: PriceRequestItem;
  totalItems: number;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onUpdateNote: (productId: string, note: string) => void;
  onRemove: (productId: string) => void;
}

export const CartItem = ({
  item,
  isExpanded,
  onToggle,
  onUpdateQuantity,
  onUpdateNote,
  onRemove
}: CartItemProps) => {
  return (
    <div className="price-request-cart-item">

      {/* ── Header : nom + badge qté + actions ── */}
      <div className="price-request-cart-item-header">
        <div className="price-request-cart-item-info">
          <h5 className="price-request-cart-item-name" title={item.product.name}>
            {item.product.name}
          </h5>
          <span className="price-request-cart-item-qty-badge">
            {item.quantity}{item.product.unit ? ` ${item.product.unit}` : ''}
          </span>
        </div>

        <div className="price-request-cart-item-actions">
          <button
            className="price-request-toggle-button"
            onClick={onToggle}
            title={isExpanded ? 'Replier' : 'Modifier'}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button
            className="price-request-remove-button"
            onClick={() => onRemove(item.product.id)}
            title="Retirer"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* ── Détails dépliables ── */}
      {isExpanded && (
        <div className="price-request-cart-item-details">

          {/* Quantité */}
          <div className="price-request-quantity-control">
            <label className="price-request-quantity-label">Quantité :</label>
            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={e => onUpdateQuantity(item.product.id, Math.max(1, parseInt(e.target.value) || 1))}
              className="price-request-quantity-input"
            />
            {item.product.unit && (
              <span style={{ fontSize: 11, color: '#888' }}>{item.product.unit}</span>
            )}
          </div>

          {/* Note / consigne */}
          <div>
            <label className="price-request-note-label">Note / Consigne</label>
            <textarea
              value={item.note}
              onChange={e => onUpdateNote(item.product.id, e.target.value)}
              className="price-request-note-input"
              placeholder="Instructions particulières pour ce produit..."
            />
          </div>

        </div>
      )}
    </div>
  );
};