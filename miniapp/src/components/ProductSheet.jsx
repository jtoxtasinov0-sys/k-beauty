import { useEffect, useState } from 'react';
import { imageUrl } from '../api.js';
import { won, formatDate } from '../i18n.js';
import { haptic } from '../telegram.js';
import { priceFor } from '../store/CartContext.jsx';

export default function ProductSheet({ product, lang, onClose, onAdd, t }) {
  const [qty, setQty] = useState(1);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!product) return null;

  const name = lang === 'ru' && product.nameRu ? product.nameRu : product.name;
  const description = lang === 'ru' && product.descriptionRu ? product.descriptionRu : product.description;
  const bullets = (description || '').split('\n').filter(Boolean);
  const img = imageUrl(product.imageUrl);
  const expiry = formatDate(product.expiryDate);

  const { isWholesale, sum } = priceFor(product, qty);
  const needMore = product.minWholesaleQty - qty;
  const hasWholesale = product.priceWholesale > 0 && product.priceWholesale < product.pricePiece;

  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet">
        <div className="sheet-grab" />

        <div className="sheet-scroll">
          <div className="sheet-img">
            {img ? <img src={img} alt={name} /> : <div className="placeholder">🧴</div>}
          </div>

          {product.brand && <span className="card-brand">{product.brand}</span>}
          <h2>{name}</h2>

          <div className="price-box">
            <div className={`price-cell${!isWholesale ? ' active' : ''}`}>
              <small>{t('piece')}</small>
              <b>{won(product.pricePiece)}</b>
            </div>
            {hasWholesale && (
              <div className={`price-cell${isWholesale ? ' active' : ''}`}>
                <small>
                  {t('wholesale')} ({product.minWholesaleQty}+)
                </small>
                <b>{won(product.priceWholesale)}</b>
              </div>
            )}
          </div>

          {hasWholesale &&
            (isWholesale ? (
              <div className="hint ok">✅ {t('wholesaleOn')}</div>
            ) : (
              <div className="hint">
                🏷 +{needMore} {t('wholesaleHint')}
              </div>
            ))}

          <div className="info-rows">
            {product.volume && (
              <div className="info-row">
                <span>{t('volume')}</span>
                <span>{product.volume}</span>
              </div>
            )}
            {expiry && (
              <div className="info-row">
                <span>{t('expiry')}</span>
                <span>{expiry}</span>
              </div>
            )}
            {product.stockQty > 0 && (
              <div className="info-row">
                <span>{t('lowStock')}</span>
                <span>{product.stockQty}</span>
              </div>
            )}
          </div>

          {bullets.length > 0 && (
            <div className="bullets">
              <h4>{t('composition')}</h4>
              <ul>
                {bullets.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="sheet-cta">
          <div className="qty">
            <button disabled={qty <= 1} onClick={() => setQty((q) => Math.max(1, q - 1))}>
              −
            </button>
            <b>{qty}</b>
            <button onClick={() => setQty((q) => q + 1)}>+</button>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => {
              haptic('medium');
              onAdd(product, qty);
              onClose();
            }}
          >
            {t('addToCart')} — {won(sum)}
          </button>
        </div>
      </div>
    </>
  );
}
