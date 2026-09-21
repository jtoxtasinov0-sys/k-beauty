import { useRef, useState } from 'react';
import { api, imageUrl } from '../api.js';

const EMPTY = {
  name: '',
  nameRu: '',
  brand: '',
  category: 'tozalovchi',
  volume: '',
  imageUrl: '',
  pricePiece: '',
  priceWholesale: '',
  minWholesaleQty: 10,
  expiryDate: '',
  stockQty: 0,
  sortOrder: 0,
  inStock: true,
  description: '',
  descriptionRu: '',
};

/** ISO sanani <input type="date"> tushunadigan ko'rinishga o'giradi. */
function toDateInput(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

export default function ProductForm({ product, categories, onClose, onSaved, onToast }) {
  const [form, setForm] = useState(() =>
    product
      ? {
          ...EMPTY,
          ...product,
          nameRu: product.nameRu || '',
          brand: product.brand || '',
          volume: product.volume || '',
          imageUrl: product.imageUrl || '',
          description: product.description || '',
          descriptionRu: product.descriptionRu || '',
          expiryDate: toDateInput(product.expiryDate),
        }
      : EMPTY,
  );

  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  async function pickImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    try {
      const data = await api.upload(file);
      setForm((f) => ({ ...f, imageUrl: data.url }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function save() {
    setError('');

    if (!form.name.trim()) return setError('Mahsulot nomini kiriting');
    if (!form.pricePiece) return setError('Donaga narxni kiriting');

    const payload = {
      ...form,
      pricePiece: Number(form.pricePiece),
      priceWholesale: Number(form.priceWholesale || form.pricePiece),
      minWholesaleQty: Number(form.minWholesaleQty || 10),
      stockQty: Number(form.stockQty || 0),
      sortOrder: Number(form.sortOrder || 0),
      expiryDate: form.expiryDate || null,
    };

    setBusy(true);
    try {
      if (product) await api.updateProduct(product.id, payload);
      else await api.createProduct(payload);

      onToast(product ? 'Mahsulot yangilandi ✓' : "Mahsulot qo'shildi ✓");
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const preview = imageUrl(form.imageUrl);

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h3>{product ? '✏️ Mahsulotni tahrirlash' : '➕ Yangi mahsulot'}</h3>

        {error && <div className="alert">{error}</div>}

        <div className="form-grid">
          {/* ===== RASM ===== */}
          <div className="field full">
            <label>Rasm</label>
            <div className="upload-box" onClick={() => fileRef.current?.click()}>
              {preview && <img className="upload-preview" src={preview} alt="" />}
              <div className="upload-hint">
                {uploading
                  ? '⏳ Yuklanmoqda...'
                  : preview
                    ? '🔄 Boshqa rasm tanlash'
                    : '📷 Galereyadan rasm tanlash uchun bosing'}
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={pickImage} />
            </div>
          </div>

          {/* ===== NOMLAR ===== */}
          <div className="field">
            <label>Nomi (o'zbekcha) *</label>
            <input value={form.name} onChange={set('name')} placeholder="ANUA Heartleaf Penka" />
          </div>

          <div className="field">
            <label>Nomi (ruscha)</label>
            <input value={form.nameRu} onChange={set('nameRu')} placeholder="ANUA Пенка" />
          </div>

          <div className="field">
            <label>Brend</label>
            <input value={form.brand} onChange={set('brand')} placeholder="ANUA" />
          </div>

          <div className="field">
            <label>Kategoriya</label>
            <select value={form.category} onChange={set('category')}>
              {categories.map((cat) => (
                <option key={cat.key} value={cat.key}>
                  {cat.emoji} {cat.uz}
                </option>
              ))}
            </select>
          </div>

          {/* ===== NARXLAR ===== */}
          <div className="field">
            <label>Donaga narx (₩) *</label>
            <input
              type="number"
              min="0"
              value={form.pricePiece}
              onChange={set('pricePiece')}
              placeholder="8000"
            />
          </div>

          <div className="field">
            <label>Optom narx (₩)</label>
            <input
              type="number"
              min="0"
              value={form.priceWholesale}
              onChange={set('priceWholesale')}
              placeholder="7000"
            />
            <small>Bo'sh qoldirilsa donaga narx bilan bir xil bo'ladi</small>
          </div>

          <div className="field">
            <label>Minimal optom soni</label>
            <input
              type="number"
              min="1"
              value={form.minWholesaleQty}
              onChange={set('minWholesaleQty')}
            />
            <small>Mijoz shu sondan ko'p olsa — optom narx qo'llanadi</small>
          </div>

          <div className="field">
            <label>Srogi (yaroqlilik muddati)</label>
            <input type="date" value={form.expiryDate} onChange={set('expiryDate')} />
          </div>

          <div className="field">
            <label>Hajmi</label>
            <input value={form.volume} onChange={set('volume')} placeholder="150 ml" />
          </div>

          <div className="field">
            <label>Ombordagi soni</label>
            <input type="number" min="0" value={form.stockQty} onChange={set('stockQty')} />
            <small>0 = cheklanmagan. 1-20 bo'lsa "Soni kam" belgisi chiqadi</small>
          </div>

          <div className="field">
            <label>Tartib raqami</label>
            <input type="number" value={form.sortOrder} onChange={set('sortOrder')} />
            <small>Kichik raqam — katalogda yuqorida turadi</small>
          </div>

          <div className="check-row">
            <input
              id="inStock"
              type="checkbox"
              checked={form.inStock}
              onChange={set('inStock')}
            />
            <label htmlFor="inStock">✅ Nalichida (sotuvda)</label>
          </div>

          {/* ===== TAVSIF ===== */}
          <div className="field full">
            <label>Tarkibi / tavsifi (o'zbekcha)</label>
            <textarea
              value={form.description}
              onChange={set('description')}
              placeholder={'• Succinic Acid 0.5%\n• Terini quritmaydi\n• Sezgir teri uchun'}
            />
            <small>Har bir qatorni • belgisi bilan boshlang — Mini App'da ro'yxat bo'lib chiqadi</small>
          </div>

          <div className="field full">
            <label>Tarkibi / tavsifi (ruscha)</label>
            <textarea
              value={form.descriptionRu}
              onChange={set('descriptionRu')}
              placeholder={'• Янтарная кислота 0.5%\n• Не сушит кожу'}
            />
          </div>
        </div>

        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>
            Bekor qilish
          </button>
          <button className="btn btn-primary" onClick={save} disabled={busy || uploading}>
            {busy ? 'Saqlanmoqda...' : '💾 Saqlash'}
          </button>
        </div>
      </div>
    </div>
  );
}
