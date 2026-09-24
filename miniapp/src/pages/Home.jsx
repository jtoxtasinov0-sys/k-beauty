import Stories from '../components/Stories.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { haptic } from '../telegram.js';

export default function Home({
  user,
  products,
  stories,
  onOpenStory,
  loading,
  lang,
  setLang,
  onOpenProduct,
  onQuickAdd,
  qtyOf,
  onGoCatalog,
  t,
}) {
  const popular = products.slice(0, 4);

  return (
    <div className="page">
      <div className="header">
        <img className="header-logo" src="/icon.webp" alt="Colibri Cosmetics" />
        <div className="header-text">
          <h2>
            {t('hello')}, {user?.firstName || '👋'}
          </h2>
          <p>{t('welcomeSub')}</p>
        </div>

        <div className="lang-switch">
          <button className={lang === 'uz' ? 'on' : ''} onClick={() => setLang('uz')}>
            UZ
          </button>
          <button className={lang === 'ru' ? 'on' : ''} onClick={() => setLang('ru')}>
            RU
          </button>
        </div>
      </div>

      <Stories stories={stories} lang={lang} onOpen={onOpenStory} />

      <div className="hero">
        <h3>{t('heroTitle')}</h3>
        <p>{t('heroSub')}</p>
        <button
          onClick={() => {
            haptic('medium');
            onGoCatalog();
          }}
        >
          {t('heroBtn')} →
        </button>
      </div>

      <div className="stat-row">
        <div className="stat">
          <b>{products.length}</b>
          <span>{lang === 'ru' ? 'товаров' : 'mahsulot'}</span>
        </div>
        <div className="stat">
          <b>10 000+</b>
          <span>{lang === 'ru' ? 'клиентов' : 'mijoz'}</span>
        </div>
        <div className="stat">
          <b>🇰🇷 🇺🇿</b>
          <span>{lang === 'ru' ? 'доставка' : 'yetkazish'}</span>
        </div>
      </div>

      <div className="section-title">
        {t('popular')}
        <button className="link-btn" onClick={onGoCatalog}>
          {t('seeAll')} →
        </button>
      </div>

      {loading ? (
        <div className="grid">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton skeleton-card" />
          ))}
        </div>
      ) : (
        <div className="grid">
          {popular.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              lang={lang}
              inCartQty={qtyOf(product.id)}
              onOpen={onOpenProduct}
              onQuickAdd={onQuickAdd}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  );
}
