import { Component } from 'react';

/**
 * Kutilmagan xato React'ni to'xtatib qo'ysa, mijoz OQ EKRAN ko'rmasligi uchun.
 * Uslublar atayin shu yerda yozilgan: CSS yuklanmay qolsa ham xabar ko'rinadi.
 */
const wrap = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  padding: '32px 24px',
  textAlign: 'center',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  color: '#111',
  background: '#fff',
};

const button = {
  marginTop: '8px',
  padding: '12px 28px',
  border: 'none',
  borderRadius: '999px',
  background: '#ff5c8a',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 600,
};

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('App xatosi:', error, info?.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div style={wrap}>
        <div style={{ fontSize: '44px' }}>😔</div>
        <h3 style={{ margin: 0, fontSize: '18px' }}>Nimadir noto‘g‘ri ketdi</h3>
        <p style={{ margin: 0, color: '#777', fontSize: '14px' }}>
          Sahifani qayta yuklab ko‘ring.
        </p>
        <button style={button} onClick={() => window.location.reload()}>
          Qayta urinish
        </button>
      </div>
    );
  }
}
