import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

const TOKEN_KEY = 'adminToken';
const STATUS_STYLE = {
  new: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-700',
};
const inputClass = 'w-full rounded-xl border border-line bg-white px-4 py-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { token } = await api.login(email, password);
      onLogin(token);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto mt-20 max-w-sm px-5">
      <form onSubmit={submit} className="rounded-3xl border border-line bg-white p-8">
        <h1 className="font-display text-2xl font-extrabold">Admin login</h1>
        <label className="mt-6 block">
          <span className="mb-1.5 block text-sm font-bold">Email</span>
          <input className={inputClass} type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-bold">Password</span>
          <input className={inputClass} type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
        <button disabled={busy} className="mt-6 w-full rounded-full bg-brand py-3 font-bold text-white hover:bg-brand-dark disabled:opacity-60">
          {busy ? 'Signing in...' : 'Sign in'}
        </button>
        <Link to="/" className="mt-4 block text-center text-sm text-muted underline">Back to the website</Link>
      </form>
    </div>
  );
}

function Dashboard({ token, onLogout }) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setItems(await api.adminList(token, { status, date }));
    } catch (err) {
      if (err.status === 401) return onLogout();
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, status, date, onLogout]);

  useEffect(() => { load(); }, [load]);

  async function change(id, next) {
    try {
      const updated = await api.adminSetStatus(token, id, next);
      setItems((list) => list.map((a) => (a._id === id ? updated : a)));
    } catch (err) {
      if (err.status === 401) return onLogout();
      setError(err.message);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-extrabold">Appointments</h1>
        <div className="flex items-center gap-3">
          <Link to="/" className="text-sm text-muted underline">Website</Link>
          <button onClick={onLogout} className="rounded-full border border-line px-4 py-2 text-sm font-semibold hover:bg-white">Log out</button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <select className="rounded-xl border border-line bg-white px-4 py-2" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input type="date" className="rounded-xl border border-line bg-white px-4 py-2" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Filter by date" />
        {(status || date) && (
          <button onClick={() => { setStatus(''); setDate(''); }} className="text-sm underline">Clear filters</button>
        )}
      </div>

      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[760px] text-start text-sm">
          <thead className="bg-paper text-start text-muted">
            <tr>
              {['Date', 'Time', 'Patient', 'Phone', 'Doctor', 'Service', 'Status', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-start font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-muted">Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-muted">No appointments found.</td></tr>
            ) : (
              items.map((a) => (
                <tr key={a._id} className="border-t border-line align-top">
                  <td className="px-4 py-3 font-semibold">{a.date}</td>
                  <td className="px-4 py-3">{a.time}</td>
                  <td className="px-4 py-3">
                    {a.name}
                    {a.notes && <span className="block max-w-[200px] text-xs text-muted">{a.notes}</span>}
                  </td>
                  <td className="px-4 py-3" dir="ltr">{a.phone}</td>
                  <td className="px-4 py-3">{a.doctor?.nameEn}</td>
                  <td className="px-4 py-3 capitalize">{a.service}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_STYLE[a.status]}`}>{a.status}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {a.status !== 'confirmed' && a.status !== 'cancelled' && (
                      <button onClick={() => change(a._id, 'confirmed')} className="me-2 rounded-lg bg-brand px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-dark">Confirm</button>
                    )}
                    {a.status !== 'cancelled' && (
                      <button onClick={() => change(a._id, 'cancelled')} className="rounded-lg border border-line px-3 py-1.5 text-xs font-bold hover:bg-paper">Cancel</button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Admin() {
  // sessionStorage clears when the tab closes, so the admin is signed out automatically.
  const [token, setToken] = useState(() => {
    try { return sessionStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; }
  });

  const login = (t) => {
    try { sessionStorage.setItem(TOKEN_KEY, t); } catch { /* ignore */ }
    setToken(t);
  };
  const logout = useCallback(() => {
    try { sessionStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
    setToken('');
  }, []);

  return token ? <Dashboard token={token} onLogout={logout} /> : <Login onLogin={login} />;
}
