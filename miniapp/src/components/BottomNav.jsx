import { haptic } from '../telegram.js';

const TABS = [
  { key: 'home', ico: '🏠', label: 'navHome' },
  { key: 'catalog', ico: '🔍', label: 'navCatalog' },
  { key: 'cart', ico: '🛒', label: 'navCart' },
  { key: 'profile', ico: '👤', label: 'navProfile' },
];

export default function BottomNav({ tab, onChange, cartCount, t }) {
  return (
    <nav className="nav">
      {TABS.map((item) => (
        <button
          key={item.key}
          className={tab === item.key ? 'on' : ''}
          onClick={() => {
            haptic();
            onChange(item.key);
          }}
        >
          <span className="ico">{item.ico}</span>
          {item.key === 'cart' && cartCount > 0 && <span className="dot">{cartCount}</span>}
          {t(item.label)}
        </button>
      ))}
    </nav>
  );
}
