import { useCallback, useEffect, useState } from 'react';
import { api, getToken, setToken } from './api.js';
import Login from './pages/Login.jsx';
import Orders from './pages/Orders.jsx';
import Products from './pages/Products.jsx';
import Stories from './pages/Stories.jsx';

export default function App() {
  const [authed, setAuthed] = useState(() => Boolean(getToken()));
  const [meta, setMeta] = useState(null);
  const [tab, setTab] = useState('orders');
  const [toast, setToast] = useState('');

  const showToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(''), 2600);
  }, []);

  // Kirgandan keyin kategoriyalar va holatlar ro'yxatini olamiz
  useEffect(() => {
    if (!authed) return;

    api
      .meta()
      .then(setMeta)
      .catch(() => {
        setToken('');
        setAuthed(false);
      });
  }, [authed]);

  function logout() {
    setToken('');
    setAuthed(false);
    setMeta(null);
  }

  if (!authed) return <Login onSuccess={() => setAuthed(true)} />;

  if (!meta) {
    return <div className="empty" style={{ margin: 40 }}>Yuklanmoqda...</div>;
  }

  return (
    <>
      <header className="topbar">
        <div className="brand">
          💄 K-Beauty <span>Admin</span>
        </div>

        <nav className="tabs">
          <button className={tab === 'orders' ? 'on' : ''} onClick={() => setTab('orders')}>
            📦 Buyurtmalar
          </button>
          <button className={tab === 'products' ? 'on' : ''} onClick={() => setTab('products')}>
            🧴 Mahsulotlar
          </button>
          <button className={tab === 'stories' ? 'on' : ''} onClick={() => setTab('stories')}>
            🎬 Storylar
          </button>
        </nav>

        <button className="logout" onClick={logout}>
          Chiqish →
        </button>
      </header>

      {tab === 'orders' && <Orders meta={meta} onToast={showToast} />}
      {tab === 'products' && <Products meta={meta} onToast={showToast} />}
      {tab === 'stories' && <Stories onToast={showToast} />}

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
