import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useLang } from '../i18n.jsx';

const SERVICE_KEYS = ['checkup', 'cleaning', 'whitening', 'braces', 'implants', 'emergency'];
const PHONE_RE = /^\+?[0-9\s-]{8,15}$/;
const WHATSAPP = (import.meta.env.VITE_WHATSAPP || '').replace(/\D/g, '');

function isoLocal(date) {
  return date.toLocaleDateString('en-CA'); // YYYY-MM-DD
}
function isFriday(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay() === 5;
}

const inputClass =
  'w-full rounded-xl border border-line bg-white px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20';

export default function Booking() {
  const { t, isAr } = useLang();
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ service: '', doctorId: '', date: '', time: '', name: '', phone: '', notes: '' });
  const [slots, setSlots] = useState(null); // null = not loaded, [] = none free
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | sending | success
  const [error, setError] = useState('');
  const [done, setDone] = useState(null);

  const today = new Date();
  const minDate = isoLocal(today);
  const maxDate = isoLocal(new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000));
  const closed = form.date && isFriday(form.date);

  // Changing the doctor or the date clears the chosen time, because slots depend on both.
  const set = (key) => (e) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [key]: value, ...(key === 'doctorId' || key === 'date' ? { time: '' } : {}) }));
  };

  useEffect(() => {
    api.doctors().then(setDoctors).catch(() => setDoctors([]));
  }, []);

  function loadSlots(doctorId, date, alive = { current: true }) {
    setSlotsLoading(true);
    api
      .slots(doctorId, date)
      .then((r) => alive.current && setSlots(r.slots))
      .catch(() => alive.current && setSlots([]))
      .finally(() => alive.current && setSlotsLoading(false));
  }

  useEffect(() => {
    setSlots(null);
    if (!form.doctorId || !form.date || closed) return;
    const alive = { current: true };
    loadSlots(form.doctorId, form.date, alive);
    return () => { alive.current = false; };
  }, [form.doctorId, form.date, closed]);

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!form.service || !form.doctorId || !form.date || !form.time) return setError(t.errMissing);
    if (form.name.trim().length < 2) return setError(t.errName);
    if (!PHONE_RE.test(form.phone.trim())) return setError(t.errPhone);

    setStatus('sending');
    try {
      const res = await api.book({
        service: form.service,
        doctorId: form.doctorId,
        date: form.date,
        time: form.time,
        name: form.name.trim(),
        phone: form.phone.trim(),
        notes: form.notes.trim(),
      });
      setDone(res);
      setStatus('success');
    } catch (err) {
      setStatus('idle');
      setError(err.message || t.errGeneric);
      if (err.status === 409) {
        setForm((f) => ({ ...f, time: '' }));
        loadSlots(form.doctorId, form.date);
      }
    }
  }

  function reset() {
    setForm({ service: '', doctorId: '', date: '', time: '', name: '', phone: '', notes: '' });
    setSlots(null);
    setDone(null);
    setStatus('idle');
  }

  if (status === 'success' && done) {
    const doctorName = isAr ? done.doctor.nameAr : done.doctor.nameEn;
    const wa = WHATSAPP
      ? `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(t.waMessage(form.name.trim(), done.date, done.time))}`
      : null;
    return (
      <div className="rounded-3xl border border-line bg-white p-8 text-center" role="status">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-brand-tint text-2xl text-brand">✓</div>
        <h3 className="font-display text-2xl font-extrabold">{t.successTitle}</h3>
        <p className="mt-2 text-muted">{t.successText}</p>
        <div className="mx-auto mt-5 max-w-sm rounded-xl bg-paper p-4 text-start text-sm">
          <p className="font-bold">{t.successSummary}</p>
          <p className="mt-1">{t.services[done.service][0]}</p>
          <p>{doctorName}</p>
          <p dir="ltr" className={isAr ? 'text-right' : ''}>{done.date}  {done.time}</p>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="rounded-full bg-brand px-6 py-3 font-bold text-white hover:bg-brand-dark">
              {t.whatsappBtn}
            </a>
          )}
          <button onClick={reset} className="rounded-full border border-line px-6 py-3 font-semibold hover:bg-paper">
            {t.newBooking}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="rounded-3xl border border-line bg-white p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-bold">{t.fService}</span>
          <select className={inputClass} value={form.service} onChange={set('service')} required>
            <option value="">{t.choose}</option>
            {SERVICE_KEYS.map((k) => (
              <option key={k} value={k}>{t.services[k][0]}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-bold">{t.fDoctor}</span>
          <select className={inputClass} value={form.doctorId} onChange={set('doctorId')} required>
            <option value="">{t.choose}</option>
            {doctors.map((d) => (
              <option key={d._id} value={d._id}>
                {isAr ? d.nameAr : d.nameEn} ({isAr ? d.specialtyAr : d.specialtyEn})
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-bold">{t.fDate}</span>
          <input type="date" className={inputClass} min={minDate} max={maxDate} value={form.date} onChange={set('date')} required />
        </label>

        <div>
          <span className="mb-1.5 block text-sm font-bold" id="time-label">{t.fTime}</span>
          {closed ? (
            <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{t.closedFriday}</p>
          ) : !form.doctorId || !form.date ? (
            <p className="rounded-xl bg-paper px-4 py-3 text-sm text-muted">{t.pickDateFirst}</p>
          ) : slotsLoading || slots === null ? (
            <p className="rounded-xl bg-paper px-4 py-3 text-sm text-muted">{t.loadingSlots}</p>
          ) : slots.length === 0 ? (
            <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{t.noSlots}</p>
          ) : (
            <div className="flex flex-wrap gap-2" role="group" aria-labelledby="time-label">
              {slots.map((s) => (
                <button
                  type="button"
                  key={s}
                  aria-pressed={form.time === s}
                  onClick={() => setForm((f) => ({ ...f, time: s }))}
                  className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                    form.time === s ? 'border-brand bg-brand text-white' : 'border-line bg-white hover:border-brand'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-bold">{t.fName}</span>
          <input className={inputClass} value={form.name} onChange={set('name')} maxLength={80} autoComplete="name" required />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-bold">{t.fPhone}</span>
          <input className={inputClass} dir="ltr" inputMode="tel" value={form.phone} onChange={set('phone')} maxLength={20} autoComplete="tel" placeholder="+20 100 000 0000" required />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-sm font-bold">{t.fNotes}</span>
          <textarea className={inputClass} rows={3} maxLength={300} value={form.notes} onChange={set('notes')} />
        </label>
      </div>

      {error && (
        <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="mt-6 w-full rounded-full bg-brand px-6 py-4 text-lg font-bold text-white transition hover:bg-brand-dark disabled:opacity-60"
      >
        {status === 'sending' ? t.sending : t.submit}
      </button>
    </form>
  );
}
