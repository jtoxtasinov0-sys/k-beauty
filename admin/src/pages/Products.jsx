import { useCallback, useEffect, useState } from 'react';
import { api, imageUrl, won } from '../api.js';
import ProductForm from '../components/ProductForm.jsx';

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('ru-RU');
}

export default function Products({ meta, onToast }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | 'new' | product
  const [category, setCategory] = useState('all');
  const [confirmId, setConfirmId] = useState(null); // o'chirishni tasdiqlash kutilayotgan mahsulot

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.products();
      setProducts(data.products);
    } catch (e) {
      onToast(e.message);
    } finally {
      setLoading(false);
    }
  }, [onToast]);

  useEffect(() => {
    load();
  }, [load]);

  /**
   * Ikki bosqichli o'chirish: birinchi bosishda tugma "Aniqmi?" ga aylanadi,
   * 4 soniya ichida yana bosilsagina o'chiriladi. Tasodifan bosib yuborishdan saqlaydi.
   */
  async function remove(product) {
    if (confirmId !== product.id) {
      setConfirmId(product.id);
      setTimeout(() => setConfirmId((id) => (id === product.id ? null : id)), 4000);
      return;
    }

    setConfirmId(null);
    try {
      await api.deleteProduct(product.id);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      onToast(`«${product.name}» o'chirildi`);
    } catch (e) {
      onToast(e.message);
    }
  }

  async function toggleStock(product) {
    try {
      await api.updateProduct(product.id, { inStock: !product.inStock });
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, inStock: !p.inStock } : p)),
      );
    } catch (e) {
      onToast(e.message);
    }
  }

  const visible =
    category === 'all' ? products : products.filter((p) => p.category === category);

  const categoryLabel = (key) => {
    const cat = meta.categories.find((c) => c.key === key);
    return cat ? `${cat.emoji} ${cat.uz}` : key;
  };

  return (
    <div className="container">
      <div className="page-head">
        <h2>🧴 Mahsulotlar ({products.length})</h2>
        <button className="btn btn-primary" onClick={() => setEditing('new')}>
          ➕ Yangi mahsulot
        </button>
      </div>

      <div className="filters">
        <button
          className={`filter-chip${category === 'all' ? ' on' : ''}`}
          onClick={() => setCategory('all')}
        >
          Hammasi
        </button>
        {meta.categories.map((cat) => (
          <button
            key={cat.key}
            className={`filter-chip${category === cat.key ? ' on' : ''}`}
            onClick={() => setCategory(cat.key)}
          >
            {cat.emoji} {cat.uz}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="empty">Yuklanmoqda...</div>
      ) : visible.length === 0 ? (
        <div className="empty">
          <div className="emoji">🧴</div>
          Bu kategoriyada mahsulot yo'q
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Rasm</th>
                <th>Nomi</th>
                <th>Kategoriya</th>
                <th>Donaga</th>
                <th>Optom</th>
                <th>Min. optom</th>
                <th>Srogi</th>
                <th>Holat</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visible.map((product) => {
                const img = imageUrl(product.imageUrl);
                return (
                  <tr key={product.id}>
                    <td>
                      {img ? (
                        <img className="thumb" src={img} alt="" />
                      ) : (
                        <div className="thumb-empty">🧴</div>
                      )}
                    </td>

                    <td>
                      <div className="cell-name">{product.name}</div>
                      {product.brand && <div className="cell-sub">{product.brand}</div>}
                      {product.volume && <div className="cell-sub">{product.volume}</div>}
                    </td>

                    <td className="nowrap">{categoryLabel(product.category)}</td>

                    <td className="nowrap price-piece">{won(product.pricePiece)}</td>

                    <td className="nowrap price-opt">{won(product.priceWholesale)}</td>

                    <td className="nowrap">{product.minWholesaleQty} dona</td>

                    <td className="nowrap cell-sub">{formatDate(product.expiryDate)}</td>

                    <td>
                      <button
                        className={`badge ${product.inStock ? 'badge-in' : 'badge-out'}`}
                        onClick={() => toggleStock(product)}
                        title="Bosib o'zgartiring"
                      >
                        {product.inStock ? 'Nalichi' : "Yo'q"}
                      </button>
                      {product.stockQty > 0 && (
                        <div className="cell-sub">{product.stockQty} dona</div>
                      )}
                    </td>

                    <td>
                      <div className="row-actions">
                        <button
                          className="icon-btn"
                          title="Tahrirlash"
                          onClick={() => setEditing(product)}
                        >
                          ✏️
                        </button>
                        <button
                          className={`icon-btn${confirmId === product.id ? ' confirming' : ''}`}
                          title={
                            confirmId === product.id
                              ? "Tasdiqlash uchun yana bosing"
                              : "O'chirish"
                          }
                          onClick={() => remove(product)}
                        >
                          {confirmId === product.id ? 'Aniqmi?' : '🗑'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <ProductForm
          product={editing === 'new' ? null : editing}
          categories={meta.categories}
          onClose={() => setEditing(null)}
          onToast={onToast}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}
