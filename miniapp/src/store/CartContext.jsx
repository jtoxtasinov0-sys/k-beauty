import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'kbeauty_cart_v1';

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Soniga qarab dona yoki optom narxni hisoblaydi. */
export function priceFor(product, qty) {
  const isWholesale = qty >= product.minWholesaleQty && product.priceWholesale > 0;
  const unitPrice = isWholesale ? product.priceWholesale : product.pricePiece;
  return { unitPrice, isWholesale, sum: unitPrice * qty };
}

export function CartProvider({ children }) {
  const [lines, setLines] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* xotira to'lgan bo'lsa e'tiborsiz */
    }
  }, [lines]);

  const value = useMemo(() => {
    const items = lines.map((line) => ({ ...line, ...priceFor(line.product, line.qty) }));
    const total = items.reduce((acc, i) => acc + i.sum, 0);
    const count = items.reduce((acc, i) => acc + i.qty, 0);

    return {
      items,
      total,
      count,

      qtyOf(productId) {
        return lines.find((l) => l.product.id === productId)?.qty || 0;
      },

      add(product, qty = 1) {
        setLines((prev) => {
          const found = prev.find((l) => l.product.id === product.id);
          if (found) {
            return prev.map((l) =>
              l.product.id === product.id ? { ...l, product, qty: l.qty + qty } : l,
            );
          }
          return [...prev, { product, qty }];
        });
      },

      setQty(productId, qty) {
        setLines((prev) =>
          qty <= 0
            ? prev.filter((l) => l.product.id !== productId)
            : prev.map((l) => (l.product.id === productId ? { ...l, qty } : l)),
        );
      },

      remove(productId) {
        setLines((prev) => prev.filter((l) => l.product.id !== productId));
      },

      clear() {
        setLines([]);
      },
    };
  }, [lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart faqat CartProvider ichida ishlaydi');
  return ctx;
}
