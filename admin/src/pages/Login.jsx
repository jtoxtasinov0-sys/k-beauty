import { useState } from 'react';
import { api, setToken } from '../api.js';

export default function Login({ onSuccess }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);

    try {
      const data = await api.login(password);
      setToken(data.token);
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <img className="logo" src="/icon.webp" alt="Colibri Cosmetics" />
        <h1>Colibri Cosmetics Admin</h1>
        <p>Boshqaruv paneliga kirish</p>

        {error && <div className="alert">{error}</div>}

        <div className="field" style={{ marginBottom: 16 }}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Parol"
            autoFocus
          />
        </div>

        <button className="btn btn-primary btn-block" disabled={busy || !password}>
          {busy ? 'Tekshirilmoqda...' : 'Kirish'}
        </button>
      </form>
    </div>
  );
}
