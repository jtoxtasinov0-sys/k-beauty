import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, won } from '../api.js';

const LANGS = { uz: "🇺🇿 O'zbekcha", ru: '🇷🇺 Русский' };

function formatDateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** "3 soat oldin" ko'rinishida — oxirgi faollikni tez tushunish uchun. */
function timeAgo(value) {
  if (!value) return '—';

  const minutes = Math.floor((Date.now() - new Date(value).getTime()) / 60000);
  if (minutes < 1) return 'hozir';
  if (minutes < 60) return `${minutes} daqiqa oldin`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} soat oldin`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} kun oldin`;

  return formatDateTime(value);
}

export function fullName(user) {
  return [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Ismsiz';
}

/**
 * Kim kirgan, qaysi Telegram profilidan va qaysi raqamdan —
 * hammasi shu oynada.
 */
export default function Customers({ onToast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.users();
      setUsers(data.users);
    } catch (e) {
      onToast(e.message);
    } finally {
      setLoading(false);
    }
  }, [onToast]);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;

    return users.filter((u) =>
      [fullName(u), u.username, u.phone, u.telegramId]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q)),
    );
  }, [users, search]);

  const withPhone = users.filter((u) => u.phone).length;
  const buyers = users.filter((u) => u.orderCount > 0).length;

  return (
    <div className="container">
      <div className="page-head">
        <h2>👥 Mijozlar ({users.length})</h2>
        <button className="btn btn-ghost" onClick={load}>
          🔄 Yangilash
        </button>
      </div>

      <div className="stats">
        <div className="stat-card">
          <small>Jami kirgan</small>
          <b>{users.length}</b>
        </div>
        <div className="stat-card">
          <small>Telefoni bor</small>
          <b>{withPhone}</b>
        </div>
        <div className="stat-card">
          <small>Buyurtma bergan</small>
          <b style={{ color: '#16a34a' }}>{buyers}</b>
        </div>
      </div>

      <div className="filters">
        <input
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Ism, @username, telefon yoki ID bo'yicha qidirish..."
        />
      </div>

      {loading ? (
        <div className="empty">Yuklanmoqda...</div>
      ) : visible.length === 0 ? (
        <div className="empty">
          <div className="emoji">👥</div>
          {search ? 'Hech kim topilmadi' : 'Hali hech kim kirmagan'}
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Profil</th>
                <th>Telefon</th>
                <th>Til</th>
                <th>Buyurtma</th>
                <th>Jami xarid</th>
                <th>Birinchi kirgan</th>
                <th>Oxirgi faollik</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((user) => (
                <tr
                  key={user.id}
                  className="row-click"
                  onClick={() => setSelected(user)}
                  title="Batafsil ko'rish"
                >
                  <td>
                    <div className="cell-name">{fullName(user)}</div>
                    <div className="cell-sub">
                      {user.username ? `@${user.username}` : 'username yo‘q'} · ID {user.telegramId}
                    </div>
                  </td>

                  <td className="nowrap">
                    {user.phone ? (
                      <a href={`tel:${user.phone}`} onClick={(e) => e.stopPropagation()}>
                        {user.phone}
                      </a>
                    ) : (
                      <span className="cell-sub">—</span>
                    )}
                  </td>

                  <td className="nowrap cell-sub">{LANGS[user.language] || user.language}</td>

                  <td className="nowrap">
                    {user.orderCount > 0 ? <b>{user.orderCount}</b> : <span className="cell-sub">0</span>}
                  </td>

                  <td className="nowrap price-opt">{user.totalWon > 0 ? won(user.totalWon) : '—'}</td>

                  <td className="nowrap cell-sub">{formatDateTime(user.createdAt)}</td>

                  <td className="nowrap cell-sub">{timeAgo(user.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && <CustomerCard user={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

/** Bitta mijozning to'liq ma'lumoti va buyurtmalari. */
export function CustomerCard({ user, onClose }) {
  const orders = user.orders || [];

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h3>👤 {fullName(user)}</h3>

        <div className="info-grid">
          <div className="info-row">
            <span>Telegram profili</span>
            <b>
              {user.username ? (
                <a href={`https://t.me/${user.username}`} target="_blank" rel="noreferrer">
                  @{user.username}
                </a>
              ) : (
                <span className="cell-sub">username yo‘q</span>
              )}
            </b>
          </div>

          <div className="info-row">
            <span>Telegram ID</span>
            <b>{user.telegramId}</b>
          </div>

          <div className="info-row">
            <span>Telefon</span>
            <b>
              {user.phone ? (
                <a href={`tel:${user.phone}`}>{user.phone}</a>
              ) : (
                <span className="cell-sub">kiritilmagan</span>
              )}
            </b>
          </div>

          <div className="info-row">
            <span>Til</span>
            <b>{LANGS[user.language] || user.language}</b>
          </div>

          <div className="info-row">
            <span>Birinchi kirgan</span>
            <b>{formatDateTime(user.createdAt)}</b>
          </div>

          <div className="info-row">
            <span>Oxirgi faollik</span>
            <b>{timeAgo(user.updatedAt)}</b>
          </div>

          {user.orderCount !== undefined && (
            <>
              <div className="info-row">
                <span>Buyurtmalar</span>
                <b>{user.orderCount} ta</b>
              </div>

              <div className="info-row">
                <span>Jami xarid</span>
                <b>{user.totalWon > 0 ? won(user.totalWon) : '—'}</b>
              </div>
            </>
          )}
        </div>

        {orders.length > 0 && (
          <>
            <div className="modal-subhead">Buyurtmalari</div>
            <div className="mini-orders">
              {orders.map((order) => (
                <div key={order.id} className="mini-order">
                  <b>#{order.id}</b>
                  <span>{formatDateTime(order.createdAt)}</span>
                  <b className="price-opt">{won(order.totalWon)}</b>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="modal-foot">
          <button className="btn btn-primary" onClick={onClose}>
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
}
