import { useCallback, useEffect, useRef, useState } from 'react';
import { api, prefetch } from './api.js';
import { readCache, writeCache } from './cache.js';
import { getItem, setItem } from './storage.js';
import { initTelegram, telegramUserId } from './telegram.js';
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
const BOOT_CACHE = 'boot';
const PRODUCTS_CACHE = 'products';

// Oxirgi marta ko'rilgan ma'lumotlar — app ochilishi bilanoq chiziladi,
// serverdan javob kutilmaydi. Yangisi kelgach ustiga yoziladi.
const cachedProducts = readCache(PRODUCTS_CACHE) || [];

// Profil ma'lumoti faqat O'SHA hisob uchun ishlatiladi: bitta telefonda
// boshqa akkaunt ochsa, avvalgi mijozning ismi ko'rinib qolmasligi kerak.
const savedBoot = readCache(BOOT_CACHE) || {};
const cachedBoot = !telegramUserId || savedBoot.tgId === telegramUserId ? savedBoot : {};

export default function App() {
  const cart = useCart();

  const [lang, setLangState] = useState(() => getItem(LANG_KEY) || 'uz');
  const [onboarded, setOnboarded] = useState(() => getItem(ONBOARD_KEY) === '1');

  const [user, setUser] = useState(cachedBoot.user || null);
  const [categories, setCategories] = useState(cachedBoot.categories || []);
  const [regions, setRegions] = useState(cachedBoot.regions || []);
  const [booted, setBooted] = useState(Boolean(cachedBoot.user));

  const [tab, setTab] = useState('home');
  const [products, setProducts] = useState(cachedProducts);
  const [loading, setLoading] = useState(true);
  const [slowServer, setSlowServer] = useState(false);
  const firstProductsLoad = useRef(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [sheetProduct, setSheetProduct] = useState(null);
  const [orders, setOrders] = useState([]);

  const t = makeT(lang);

  const setLang = useCallback((value) => {
    setLangState(value);
    setItem(LANG_KEY, value);
  }, []);

  // ===== Ishga tushirish =====
  // So'rov api.js da, sahifa ochilishi bilanoq boshlangan — bu yerda faqat
  // natijasini olamiz. Shuning uchun React chizilishini kutish shart emas.
  useEffect(() => {
    initTelegram();

    prefetch.me
      .then((data) => {
        if (data?.__error) throw data.__error;

        setUser(data.user);
        setCategories(data.categories);
        setRegions(data.regions);
        writeCache(BOOT_CACHE, {
          tgId: telegramUserId,
          user: data.user,
          categories: data.categories,
          regions: data.regions,
        });

        if (!getItem(LANG_KEY) && data.user?.language) setLang(data.user.language);
      })
      .catch((e) => console.error('me() xatosi:', e.message))
      .finally(() => setBooted(true));
  }, [setLang]);

  // Server uxlab qolgan bo'lsa birinchi javob kechikadi — foydalanuvchi
  // nima bo'layotganini bilib tursin.
  useEffect(() => {
    if (booted || cachedProducts.length > 0) return undefined;
    const timer = setTimeout(() => setSlowServer(true), 5000);
    return () => clearTimeout(timer);
  }, [booted]);

  // ===== Mahsulotlarni yuklash =====
  useEffect(() => {
    let alive = true;
    setLoading(true);

    const isDefaultView = category === 'all' && !search;
    const usePrefetched = firstProductsLoad.current && isDefaultView;
    firstProductsLoad.current = false;

    const timer = setTimeout(() => {
      // Birinchi ochilishda so'rov allaqachon yuborilgan — uni qayta yubormaymiz.
      const pending = usePrefetched ? prefetch.products : api.products({ category, search });

      pending
        .then((data) => {
          if (!alive) return;
          if (data?.__error) throw data.__error;

          setProducts(data.products);
          // Faqat asosiy ro'yxat saqlanadi — qidiruv natijasi emas.
          if (isDefaultView) writeCache(PRODUCTS_CACHE, data.products);
        })
        .catch((e) => console.error('products() xatosi:', e.message))
        .finally(() => alive && setLoading(false));
    }, usePrefetched || !search ? 0 : 300);

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
          setItem(ONBOARD_KEY, '1');
          setOnboarded(true);
        }}
      />
    );
  }

  // Saqlangan ma'lumot bo'lsa — darhol ko'rsatamiz, serverni kutmaymiz.
  if (!booted && products.length === 0) {
    return (
      <div className="app">
        <div className="center-state">
          <div className="emoji">💄</div>
          <p>{t('loading')}</p>
          {slowServer && <p className="muted">{t('wakingUp')}</p>}
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
          loading={loading && products.length === 0}
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
          loading={loading && products.length === 0}
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
