import ProductCard from '../components/ProductCard.jsx';
import { haptic } from '../telegram.js';

export default function Catalog({
  products,
  loading,
  categories,
  category,
  setCategory,
  search,
  setSearch,
  lang,
  onOpenProduct,
  onQuickAdd,
  qtyOf,
  t,
}) {
  return (
    <div className="page">
      <div className="header">
        <h2>{t('navCatalog')}</h2>
      </div>

      <div className="search">
        <span className="icon">🔍</span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('search')}
        />
      </div>

      <div className="chips">
        <button
          className={`chip${category === 'all' ? ' on' : ''}`}
          onClick={() => {
            haptic();
            setCategory('all');
          }}
        >
          {t('allCategories')}
        </button>

        {categories.map((cat) => (
          <button
            key={cat.key}
            className={`chip${category === cat.key ? ' on' : ''}`}
            onClick={() => {
              haptic();
              setCategory(cat.key);
            }}
          >
            {cat.emoji} {lang === 'ru' ? cat.ru : cat.uz}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton skeleton-card" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="center-state">
          <div className="emoji">🔎</div>
          <h3>{t('nothingFound')}</h3>
        </div>
      ) : (
        <div className="grid">
          {products.map((product) => (
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
