import { useEffect, useState } from 'react';
import { api, imageUrl } from '../api.js';
import { won } from '../i18n.js';
import { haptic, notifySuccess, closeApp } from '../telegram.js';

function Line({ line, lang, onQty, t }) {
  const { product, qty, unitPrice, isWholesale, sum } = line;
  const name = lang === 'ru' && product.nameRu ? product.nameRu : product.name;
  const img = imageUrl(product.imageUrl);

  return (
    <div className="cart-line">
      <div className="cart-line-img">
        {img ? <img src={img} alt={name} /> : <div className="placeholder">🧴</div>}
      </div>

      <div className="cart-line-main">
        <div>
          <div className="cart-line-name">{name}</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
            {qty} × {won(unitPrice)}
          </div>
          {isWholesale && <span className="tag-wholesale">🏷 {t('wholesale')}</span>}
        </div>

        <div className="cart-line-foot">
          <div className="qty">
            <button onClick={() => onQty(product.id, qty - 1)}>{qty === 1 ? '🗑' : '−'}</button>
            <b>{qty}</b>
            <button onClick={() => onQty(product.id, qty + 1)}>+</button>
          </div>
          <span className="cart-line-sum">{won(sum)}</span>
        </div>
      </div>
    </div>
  );
}

export default function Cart({
  items,
  total,
  count,
  setQty,
  clear,
  products,
  user,
  regions,
  lang,
  onGoCatalog,
  onOrdered,
  addToCart,
  t,
}) {
  const [checkout, setCheckout] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    region: 'KR',
    customerName: '',
    phone: '',
    address: '',
    comment: '',
  });

  useEffect(() => {
    setForm((f) => ({
      ...f,
      customerName: f.customerName || [user?.firstName, user?.lastName].filter(Boolean).join(' '),
      phone: f.phone || user?.phone || '',
    }));
  }, [user]);

  // Savatchada yo'q, eng arzon mahsulotni bir marta tanlab olamiz va shuni taklif qilib turamiz
  const [upsellId, setUpsellId] = useState(null);

  useEffect(() => {
    if (upsellId || products.length === 0 || items.length === 0) return;

    const inCart = new Set(items.map((i) => i.product.id));
    const pick = products
      .filter((p) => !inCart.has(p.id))
      .sort((a, b) => a.pricePiece - b.pricePiece)[0];

    if (pick) setUpsellId(pick.id);
  }, [products, items, upsellId]);

  const upsell = products.find((p) => p.id === upsellId);
  const upsellOn = items.some((i) => i.product.id === upsellId);

  if (success) {
    return (
      <div className="success">
        <div className="check">🎉</div>
        <h2>{t('successTitle')}</h2>
        <p>{t('successText')}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="page">
        <div className="header">
          <h2>{t('cartTitle')}</h2>
        </div>
        <div className="center-state">
          <div className="emoji">🛒</div>
          <h3>{t('cartEmpty')}</h3>
          <p>{t('cartEmptySub')}</p>
          <button className="btn btn-outline" style={{ marginTop: 20 }} onClick={onGoCatalog}>
            {t('goCatalog')}
          </button>
        </div>
      </div>
    );
  }

  async function submit() {
    setError('');

    if (!form.customerName.trim() || !form.phone.trim() || !form.address.trim()) {
      setError(t('required'));
      return;
    }

    setSending(true);
    try {
      await api.createOrder({
        items: items.map((i) => ({ productId: i.product.id, qty: i.qty })),
        ...form,
      });

      notifySuccess();
      clear();
      setSuccess(true);
      onOrdered?.();

      // Mini App yopiladi — bot tasdiq xabarini yuboradi
      setTimeout(() => closeApp(), 2500);
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  }

  // ===== Rasmiylashtirish formasi =====
  if (checkout) {
    return (
      <div className="page">
        <div className="header">
          <h2>{t('orderTitle')}</h2>
          <button className="link-btn" onClick={() => setCheckout(false)}>
            ← {t('back')}
          </button>
        </div>

        {error && <div className="alert">{error}</div>}

        <div className="field">
          <label>{t('region')}</label>
          <div className="region-row">
            {regions.map((region) => (
              <button
                key={region.key}
                className={`region-btn${form.region === region.key ? ' on' : ''}`}
                onClick={() => {
                  haptic();
                  setForm({ ...form, region: region.key });
                }}
              >
                <span className="flag">{region.flag}</span>
                {lang === 'ru' ? region.ru : region.uz}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>{t('fullName')}</label>
          <input
            value={form.customerName}
            onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            placeholder="Abdurahmon"
          />
        </div>

        <div className="field">
          <label>{t('phone')}</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+82 10 1234 5678"
          />
        </div>

        <div className="field">
          <label>{t('address')}</label>
          <textarea
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder={t('addressHint')}
          />
        </div>

        <div className="field">
          <label>{t('comment')}</label>
          <textarea
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
          />
        </div>

        <div className="note">ℹ️ {t('shippingNote')}</div>

        <div className="sticky-bar">
          <div className="sticky-total">
            <span className="muted">
              {t('total')} · {count} {t('items')}
            </span>
            <b>{won(total)}</b>
          </div>
          <button className="btn btn-primary" disabled={sending} onClick={submit}>
            {sending ? t('sending') : t('confirm')}
          </button>
        </div>
      </div>
    );
  }

  // ===== Savatcha ro'yxati =====
  return (
    <div className="page">
      <div className="header">
        <h2>{t('cartTitle')}</h2>
        <span className="muted" style={{ fontSize: 13 }}>
          {count} {t('items')}
        </span>
      </div>

      {items.map((line) => (
        <Line key={line.product.id} line={line} lang={lang} onQty={setQty} t={t} />
      ))}

      {upsell && (
        <div className="upsell">
          <div className="upsell-text">
            <b>{t('upsellTitle')}</b>
            «{lang === 'ru' && upsell.nameRu ? upsell.nameRu : upsell.name}» {t('upsellMid')}{' '}
            {won(upsell.pricePiece)} {t('upsellEnd')}
          </div>
          <button
            className={`switch${upsellOn ? ' on' : ''}`}
            onClick={() => {
              haptic('medium');
              if (upsellOn) setQty(upsell.id, 0);
              else addToCart(upsell, 1);
            }}
          />
        </div>
      )}

      <div className="sticky-bar">
        <div className="sticky-total">
          <span className="muted">{t('total')}</span>
          <b>{won(total)}</b>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            haptic('medium');
            setCheckout(true);
          }}
        >
          {t('checkout')} →
        </button>
      </div>
    </div>
  );
}
