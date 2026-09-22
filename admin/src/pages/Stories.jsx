import { useCallback, useEffect, useRef, useState } from 'react';
import { api, imageUrl } from '../api.js';

const EMPTY = { title: '', titleRu: '', imageUrl: '', productId: '', sortOrder: 0, active: true };

/**
 * Bosh sahifadagi dumaloq storylar.
 * "Faol" belgisi bilan kundan-kunga almashtirib turiladi — o'chirish shart emas.
 */
export default function Stories({ onToast }) {
  const [stories, setStories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | 'new' | story
  const [confirmId, setConfirmId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, p] = await Promise.all([api.stories(), api.products()]);
      setStories(s.stories);
      setProducts(p.products);
    } catch (e) {
      onToast(e.message);
    } finally {
      setLoading(false);
    }
  }, [onToast]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleActive(story) {
    try {
      await api.updateStory(story.id, { active: !story.active });
      setStories((prev) =>
        prev.map((s) => (s.id === story.id ? { ...s, active: !s.active } : s)),
      );
    } catch (e) {
      onToast(e.message);
    }
  }

  /** Ikki bosqichli o'chirish — tasodifan bosib yuborishdan saqlaydi. */
  async function remove(story) {
    if (confirmId !== story.id) {
      setConfirmId(story.id);
      setTimeout(() => setConfirmId((id) => (id === story.id ? null : id)), 4000);
      return;
    }

    setConfirmId(null);
    try {
      await api.deleteStory(story.id);
      setStories((prev) => prev.filter((s) => s.id !== story.id));
      onToast(`«${story.title}» o'chirildi`);
    } catch (e) {
      onToast(e.message);
    }
  }

  const activeCount = stories.filter((s) => s.active).length;
  const productName = (id) => products.find((p) => p.id === id)?.name || '—';

  return (
    <div className="container">
      <div className="page-head">
        <h2>
          🎬 Storylar ({activeCount} ta faol / {stories.length})
        </h2>
        <button className="btn btn-primary" onClick={() => setEditing('new')}>
          ➕ Yangi story
        </button>
      </div>

      <p className="hint-line">
        Storylar mijozning bosh sahifasida yuqorida dumaloq bo'lib chiqadi.
        Kunda almashtirish uchun eskisini <b>o'chirmang</b> — «Faol» belgisini
        o'chirib qo'ying, keyin kerak bo'lganda yana yoqasiz.
      </p>

      {loading ? (
        <div className="empty">Yuklanmoqda...</div>
      ) : stories.length === 0 ? (
        <div className="empty">
          <div className="emoji">🎬</div>
          Hali story qo'shilmagan
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Rasm</th>
                <th>Sarlavha</th>
                <th>Bosilganda ochiladi</th>
                <th>Tartib</th>
                <th>Holat</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {stories.map((story) => {
                const img = imageUrl(story.imageUrl);
                return (
                  <tr key={story.id} className={story.active ? '' : 'row-off'}>
                    <td>
                      {img ? (
                        <img className="thumb" src={img} alt="" />
                      ) : (
                        <div className="thumb-empty">🎬</div>
                      )}
                    </td>

                    <td>
                      <div className="cell-name">{story.title}</div>
                      {story.titleRu && <div className="cell-sub">{story.titleRu}</div>}
                    </td>

                    <td className="cell-sub">
                      {story.productId ? `🧴 ${productName(story.productId)}` : '— (faqat rasm)'}
                    </td>

                    <td className="nowrap">{story.sortOrder}</td>

                    <td>
                      <button
                        className={`badge ${story.active ? 'badge-in' : 'badge-out'}`}
                        onClick={() => toggleActive(story)}
                        title="Bosib o'zgartiring"
                      >
                        {story.active ? 'Faol' : "O'chiq"}
                      </button>
                    </td>

                    <td>
                      <div className="row-actions">
                        <button
                          className="icon-btn"
                          title="Tahrirlash"
                          onClick={() => setEditing(story)}
                        >
                          ✏️
                        </button>
                        <button
                          className={`icon-btn${confirmId === story.id ? ' confirming' : ''}`}
                          title={confirmId === story.id ? 'Tasdiqlash uchun yana bosing' : "O'chirish"}
                          onClick={() => remove(story)}
                        >
                          {confirmId === story.id ? 'Aniqmi?' : '🗑'}
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
        <StoryForm
          story={editing === 'new' ? null : editing}
          products={products}
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

function StoryForm({ story, products, onClose, onToast, onSaved }) {
  const [form, setForm] = useState(() =>
    story
      ? {
          title: story.title || '',
          titleRu: story.titleRu || '',
          imageUrl: story.imageUrl || '',
          productId: story.productId ? String(story.productId) : '',
          sortOrder: story.sortOrder ?? 0,
          active: story.active ?? true,
        }
      : { ...EMPTY },
  );
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  /** Mahsulot tanlansa — rasm va sarlavha o'zi to'ldiriladi (bo'sh bo'lsa). */
  function pickProduct(e) {
    const id = e.target.value;
    const product = products.find((p) => String(p.id) === id);

    setForm((f) => ({
      ...f,
      productId: id,
      imageUrl: f.imageUrl || product?.imageUrl || '',
      title: f.title || product?.name || '',
      titleRu: f.titleRu || product?.nameRu || '',
    }));
  }

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
    if (!form.title.trim()) return setError('Sarlavhani kiriting');
    if (!form.imageUrl) return setError('Rasm tanlang');

    const payload = {
      title: form.title.trim(),
      titleRu: form.titleRu.trim(),
      imageUrl: form.imageUrl,
      productId: form.productId ? Number(form.productId) : null,
      sortOrder: Number(form.sortOrder || 0),
      active: Boolean(form.active),
    };

    setBusy(true);
    try {
      if (story) await api.updateStory(story.id, payload);
      else await api.createStory(payload);

      onToast(story ? 'Story yangilandi ✓' : "Story qo'shildi ✓");
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
        <h3>{story ? '✏️ Storyni tahrirlash' : '➕ Yangi story'}</h3>

        {error && <div className="alert">{error}</div>}

        <div className="form-grid">
          <div className="field full">
            <label>Mahsulotdan tanlash</label>
            <select value={form.productId} onChange={pickProduct}>
              <option value="">— mahsulotsiz (faqat rasm) —</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <small>
              Tanlasangiz rasm va sarlavha o'zi to'ldiriladi. Mijoz storyni bosganda
              shu mahsulot ochiladi.
            </small>
          </div>

          <div className="field full">
            <label>Rasm *</label>
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

          <div className="field">
            <label>Sarlavha (o'zbekcha) *</label>
            <input value={form.title} onChange={set('title')} placeholder="Yangi tushdi" />
          </div>

          <div className="field">
            <label>Sarlavha (ruscha)</label>
            <input value={form.titleRu} onChange={set('titleRu')} placeholder="Новинка" />
          </div>

          <div className="field">
            <label>Tartib raqami</label>
            <input
              type="number"
              value={form.sortOrder}
              onChange={set('sortOrder')}
              placeholder="0"
            />
            <small>Kichik raqam chapda turadi</small>
          </div>

          <div className="field">
            <label>Holati</label>
            <label className="checkline">
              <input type="checkbox" checked={form.active} onChange={set('active')} />
              Faol — mijozga ko'rinsin
            </label>
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
