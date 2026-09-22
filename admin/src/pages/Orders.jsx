import { useCallback, useEffect, useState } from 'react';
import { api, won } from '../api.js';
import { CustomerCard } from './Customers.jsx';

const AUTO_REFRESH_MS = 15000;

function formatDate(value) {
  return new Date(value).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Orders({ meta, onToast }) {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [customer, setCustomer] = useState(null); // ochilgan mijoz kartochkasi

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const [orderData, statData] = await Promise.all([api.orders(status), api.stats()]);
        setOrders(orderData.orders);
        setStats(statData);
      } catch (e) {
        onToast(e.message);
      } finally {
        setLoading(false);
      }
    },
    [status, onToast],
  );

  useEffect(() => {
    load();
  }, [load]);

  // Yangi buyurtmalar o'zi paydo bo'lishi uchun
  useEffect(() => {
    const timer = setInterval(() => load(true), AUTO_REFRESH_MS);
    return () => clearInterval(timer);
  }, [load]);

  async function changeStatus(id, value) {
    try {
      await api.setOrderStatus(id, value);
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: value } : o)));
      onToast('Holat yangilandi ✓');
    } catch (e) {
      onToast(e.message);
    }
  }

  async function removeOrder(id) {
    if (!confirm(`Buyurtma №${id} o'chirilsinmi?`)) return;
    try {
      await api.deleteOrder(id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
      onToast("Buyurtma o'chirildi");
    } catch (e) {
      onToast(e.message);
    }
  }

  const statusColor = (key) => meta.statuses.find((s) => s.key === key)?.color || '#64748b';
  // Windows'da bayroq emojilari "uz"/"kr" matn bo'lib chiqadi — shuning uchun faqat nom
  const regionLabel = (key) => meta.regions.find((r) => r.key === key)?.uz || key;

  return (
    <div className="container">
      <div className="page-head">
        <h2>📦 Buyurtmalar</h2>
        <button className="btn btn-ghost" onClick={() => load()}>
          🔄 Yangilash
        </button>
      </div>

      {stats && (
        <div className="stats">
          <div className="stat-card">
            <small>Jami buyurtma</small>
            <b>{stats.total}</b>
          </div>
          <div className="stat-card">
            <small>Yangi</small>
            <b style={{ color: '#2563eb' }}>{stats.new}</b>
          </div>
          <div className="stat-card">
            <small>Yetkazilgan</small>
            <b style={{ color: '#16a34a' }}>{stats.delivered}</b>
          </div>
          <div className="stat-card">
            <small>Umumiy savdo</small>
            <b>{won(stats.revenueWon)}</b>
          </div>
          <div className="stat-card">
            <small>Mijozlar</small>
            <b>{stats.users}</b>
          </div>
        </div>
      )}

      <div className="filters">
        <button
          className={`filter-chip${status === 'all' ? ' on' : ''}`}
          onClick={() => setStatus('all')}
        >
          Hammasi
        </button>
        {meta.statuses.map((s) => (
          <button
            key={s.key}
            className={`filter-chip${status === s.key ? ' on' : ''}`}
            onClick={() => setStatus(s.key)}
          >
            {s.uz}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="empty">Yuklanmoqda...</div>
      ) : orders.length === 0 ? (
        <div className="empty">
          <div className="emoji">📭</div>
          Hozircha buyurtma yo'q
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>№</th>
                <th>Mijoz</th>
                <th>Mahsulotlar</th>
                <th>Yetkazish</th>
                <th>Jami</th>
                <th>Sana</th>
                <th>Holat</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const items = Array.isArray(order.items) ? order.items : [];
                return (
                  <tr key={order.id}>
                    <td className="nowrap">
                      <b>#{order.id}</b>
                    </td>

                    {/* Bosilsa — mijozning to'liq profili ochiladi */}
                    <td
                      className={order.user ? 'row-click' : undefined}
                      onClick={() => order.user && setCustomer(order.user)}
                      title={order.user ? "Profilni ko'rish" : undefined}
                    >
                      <div className="cell-name">{order.customerName}</div>
                      <div className="cell-sub">
                        <a href={`tel:${order.phone}`} onClick={(e) => e.stopPropagation()}>
                          {order.phone}
                        </a>
                      </div>
                      {order.user && (
                        <div className="cell-sub">
                          {order.user.username ? `@${order.user.username}` : 'username yo‘q'}
                          {' · ID '}
                          {order.user.telegramId}
                        </div>
                      )}
                    </td>

                    <td>
                      <div className="order-items-cell">
                        {items.map((item, i) => (
                          <div key={i}>
                            {item.qty} × {item.name} — {won(item.sum)}
                            {item.isWholesale && <span className="wholesale-mark"> (optom)</span>}
                          </div>
                        ))}
                      </div>
                    </td>

                    <td>
                      <div className="nowrap">{regionLabel(order.region)}</div>
                      <div className="cell-sub">{order.address}</div>
                      {order.comment && <div className="cell-sub">💬 {order.comment}</div>}
                    </td>

                    <td className="nowrap price-piece">{won(order.totalWon)}</td>

                    <td className="nowrap cell-sub">{formatDate(order.createdAt)}</td>

                    <td>
                      <select
                        className="status-select"
                        value={order.status}
                        style={{ color: statusColor(order.status) }}
                        onChange={(e) => changeStatus(order.id, e.target.value)}
                      >
                        {meta.statuses.map((s) => (
                          <option key={s.key} value={s.key}>
                            {s.uz}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td>
                      <button
                        className="icon-btn"
                        title="O'chirish"
                        onClick={() => removeOrder(order.id)}
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {customer && <CustomerCard user={customer} onClose={() => setCustomer(null)} />}
    </div>
  );
}
