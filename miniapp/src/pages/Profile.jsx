import { useState } from 'react';
import { api } from '../api.js';
import { won } from '../i18n.js';
import { haptic } from '../telegram.js';

const STATUS_COLORS = {
  NEW: '#2563eb',
  CONFIRMED: '#7c3aed',
  SHIPPED: '#ea580c',
  DELIVERED: '#16a34a',
  CANCELLED: '#dc2626',
};

export default function Profile({ user, orders, lang, setLang, onRepeat, onUserChange, t }) {
  const [phone, setPhone] = useState(user?.phone || '');
  const [saved, setSaved] = useState(false);

  async function savePhone() {
    haptic();
    try {
      const data = await api.saveProfile({ phone, language: lang });
      onUserChange?.(data.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      /* xatoni jim o'tkazamiz */
    }
  }

  const initial = (user?.firstName || '?').charAt(0).toUpperCase();

  return (
    <div className="page">
      <div className="profile-head">
        <div className="avatar">{initial}</div>
        <div>
          <h2>
            {user?.firstName} {user?.lastName || ''}
          </h2>
          <p>{user?.username ? `@${user.username}` : `ID: ${user?.telegramId}`}</p>
        </div>
      </div>

      <div className="section-title">{t('phone')}</div>
      <div className="field">
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+82 10 1234 5678"
          />
          <button
            className="btn btn-ghost"
            style={{ width: 'auto', padding: '13px 18px', whiteSpace: 'nowrap' }}
            onClick={savePhone}
          >
            {saved ? t('saved') : t('savePhone')}
          </button>
        </div>
      </div>

      <div className="section-title">{t('language')}</div>
      <div className="region-row">
        <button className={`region-btn${lang === 'uz' ? ' on' : ''}`} onClick={() => setLang('uz')}>
          <span className="flag">🇺🇿</span>
          O‘zbekcha
        </button>
        <button className={`region-btn${lang === 'ru' ? ' on' : ''}`} onClick={() => setLang('ru')}>
          <span className="flag">🇷🇺</span>
          Русский
        </button>
      </div>

      <div className="section-title">📜 {t('myOrders')}</div>

      {orders.length === 0 ? (
        <div className="center-state">
          <div className="emoji">📦</div>
          <h3>{t('noOrders')}</h3>
        </div>
      ) : (
        orders.map((order) => {
          const items = Array.isArray(order.items) ? order.items : [];
          return (
            <div key={order.id} className="order-card">
              <div className="order-top">
                <b>
                  {t('orderNo')}
                  {order.id}
                </b>
                <span className="status" style={{ background: STATUS_COLORS[order.status] }}>
                  {t(order.status)}
                </span>
              </div>

              <div className="order-items">
                {items.map((item, i) => (
                  <div key={i}>
                    {item.qty} × {item.name}
                  </div>
                ))}
              </div>

              <div className="order-foot">
                <b>{won(order.totalWon)}</b>
                <button
                  className="repeat-btn"
                  onClick={() => {
                    haptic('medium');
                    onRepeat(items);
                  }}
                >
                  🔄 {t('orderAgain')}
                </button>
              </div>

              <div className="muted" style={{ fontSize: 11.5, marginTop: 8 }}>
                {new Date(order.createdAt).toLocaleString('ru-RU', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
