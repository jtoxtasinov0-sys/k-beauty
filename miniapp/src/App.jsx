import { useCallback, useEffect, useState } from 'react';
import { api } from './api.js';
import { initTelegram } from './telegram.js';
import { makeT } from './i18n.js';
import { useCart } from './store/CartContext.jsx';

import Onboarding from './pages/Onboarding.jsx';
import Home from './pages/Home.jsx';
import Catalog from './pages/Catalog.jsx';
import Cart from './pages/Cart.jsx';
import Profile from './pages/Profile.jsx';
import BottomNav from './components/BottomNav.jsx';
import ProductSheet from './components/ProductSheet.jsx';

const ONBOARD_KEY = 'kbeauty_onboarded_v1';
const LANG_KEY = 'kbeauty_lang';

export default function App() {
  const cart = useCart();

  const [lang, setLangState] = useState(() => localStorage.getItem(LANG_KEY) || 'uz');
  const [onboarded, setOnboarded] = useState(() => localStorage.getItem(ONBOARD_KEY) === '1');

  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [regions, setRegions] = useState([]);
  const [booted, setBooted] = useState(false);

  const [tab, setTab] = useState('home');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [sheetProduct, setSheetProduct] = useState(null);
  const [orders, setOrders] = useState([]);

  const t = makeT(lang);

  const setLang = useCallback((value) => {
    setLangState(value);
    localStorage.setItem(LANG_KEY, value);
  }, []);

  // ===== Ishga tushirish =====
  useEffect(() => {
    initTelegram();

    api
      .me()
      .then((data) => {
        setUser(data.user);
        setCategories(data.categories);
        setRegions(data.regions);
        if (!localStorage.getItem(LANG_KEY) && data.user?.language) setLang(data.user.language);
      })
      .catch((e) => console.error('me() xatosi:', e.message))
      .finally(() => setBooted(true));
  }, [setLang]);

  // ===== Mahsulotlarni yuklash =====
  useEffect(() => {
    let alive = true;
    setLoading(true);

    const timer = setTimeout(() => {
      api
        .products({ category, search })
        .then((data) => alive && setProducts(data.products))
        .catch((e) => console.error('products() xatosi:', e.message))
        .finally(() => alive && setLoading(false));
    }, search ? 300 : 0);

    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [category, search]);

  // ===== Buyurtmalar tarixi =====
  const loadOrders = useCallback(() => {
    api
      .myOrders()
      .then((data) => setOrders(data.orders))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (tab === 'profile') loadOrders();
  }, [tab, loadOrders]);

  // ===== Handlerlar =====
  function goCatalog() {
    setTab('catalog');
  }

  function selectBrand(brand) {
    setSearch(brand);
    setCategory('all');
    setTab('catalog');
  }

  function repeatOrder(items) {
    const byId = new Map(products.map((p) => [p.id, p]));
    for (const item of items) {
      const product = byId.get(item.productId);
      if (product) cart.add(product, item.qty);
    }
    setTab('cart');
  }

  if (!onboarded) {
    return (
      <Onboarding
        t={t}
        onDone={() => {
          localStorage.setItem(ONBOARD_KEY, '1');
          setOnboarded(true);
        }}
      />
    );
  }

  if (!booted) {
    return (
      <div className="app">
        <div className="center-state">
          <div className="emoji">💄</div>
          <p>{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {tab === 'home' && (
        <Home
          user={user}
          products={products}
          loading={loading}
          lang={lang}
          setLang={setLang}
          qtyOf={cart.qtyOf}
          onOpenProduct={setSheetProduct}
          onQuickAdd={(product) => cart.add(product, 1)}
          onGoCatalog={goCatalog}
          onSelectBrand={selectBrand}
          t={t}
        />
      )}

      {tab === 'catalog' && (
        <Catalog
          products={products}
          loading={loading}
          categories={categories}
          category={category}
          setCategory={setCategory}
          search={search}
          setSearch={setSearch}
          lang={lang}
          qtyOf={cart.qtyOf}
          onOpenProduct={setSheetProduct}
          onQuickAdd={(product) => cart.add(product, 1)}
          t={t}
        />
      )}

      {tab === 'cart' && (
        <Cart
          items={cart.items}
          total={cart.total}
          count={cart.count}
          setQty={cart.setQty}
          clear={cart.clear}
          addToCart={cart.add}
          products={products}
          user={user}
          regions={regions}
          lang={lang}
          onGoCatalog={goCatalog}
          onOrdered={loadOrders}
          t={t}
        />
      )}

      {tab === 'profile' && (
        <Profile
          user={user}
          orders={orders}
          lang={lang}
          setLang={setLang}
          onRepeat={repeatOrder}
          onUserChange={setUser}
          t={t}
        />
      )}

      <BottomNav tab={tab} onChange={setTab} cartCount={cart.count} t={t} />

      {sheetProduct && (
        <ProductSheet
          product={sheetProduct}
          lang={lang}
          onClose={() => setSheetProduct(null)}
          onAdd={cart.add}
          t={t}
        />
      )}
    </div>
  );
}
