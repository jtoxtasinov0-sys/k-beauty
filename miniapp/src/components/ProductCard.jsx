import { imageUrl } from '../api.js';
import { won, formatDate } from '../i18n.js';
import { haptic } from '../telegram.js';

export default function ProductCard({ product, lang, inCartQty, onOpen, onQuickAdd, t }) {
  const name = lang === 'ru' && product.nameRu ? product.nameRu : product.name;
  const img = imageUrl(product.imageUrl);
  const hasDiscount = product.priceWholesale > 0 && product.priceWholesale < product.pricePiece;
  const expiry = formatDate(product.expiryDate);

  return (
    <div className="card" onClick={() => onOpen(product)}>
      <div className="card-img">
        {img ? (
          <img src={img} alt={name} loading="lazy" />
        ) : (
          <div className="placeholder">🧴</div>
        )}

        {product.stockQty > 0 && product.stockQty <= 20 && (
          <span className="card-badge">{t('lowStock')}</span>
        )}

        <button
          className={`card-add${inCartQty > 0 ? ' added' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            haptic();
            onQuickAdd(product);
          }}
        >
          {inCartQty > 0 ? inCartQty : '+'}
        </button>
      </div>

      <div className="card-body">
        {product.brand && <span className="card-brand">{product.brand}</span>}
        <div className="card-name">{name}</div>

        <div className="price-row">
          {hasDiscount ? (
            <>
              <span className="price-old">{won(product.pricePiece)}</span>
              <span className="price-new">{won(product.priceWholesale)}</span>
            </>
          ) : (
            <span className="price-single">{won(product.pricePiece)}</span>
          )}
        </div>

        {expiry && (
          <div className="card-expiry">
            {t('expiry')}: {expiry}
          </div>
        )}
      </div>
    </div>
  );
}
