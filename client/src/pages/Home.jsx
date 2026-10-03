import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Booking from '../components/Booking.jsx';
import { api } from '../api.js';
import { useLang } from '../i18n.jsx';

const SERVICE_KEYS = ['checkup', 'cleaning', 'whitening', 'braces', 'implants', 'emergency'];
const PHONE = import.meta.env.VITE_PHONE || '+20 100 000 0000';

export default function Home() {
  const { t, isAr } = useLang();
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    api.doctors().then(setDoctors).catch(() => setDoctors([]));
  }, []);

  return (
    <>
      <Header />
      <main>
        <section className="bg-brand text-white">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
            <h1 className="rise font-display max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              {t.heroTitle}
            </h1>
            <p className="rise mt-5 max-w-xl text-lg text-white/85" style={{ animationDelay: '.1s' }}>{t.heroSub}</p>
            <div className="rise mt-8 flex flex-wrap items-center gap-4" style={{ animationDelay: '.2s' }}>
              <a href="#book" className="rounded-full bg-white px-7 py-3.5 font-bold text-brand-dark transition hover:-translate-y-0.5 hover:shadow-lg">
                {t.heroCta}
              </a>
              <span className="text-sm text-white/80">{t.heroNote}</span>
            </div>
          </div>
        </section>

        <section id="services" className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl">{t.servicesTitle}</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICE_KEYS.map((k) => (
              <div key={k} className="rounded-2xl border border-line bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg">
                <h3 className="font-display text-xl font-extrabold">{t.services[k][0]}</h3>
                <p className="mt-2 text-muted">{t.services[k][1]}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="doctors" className="bg-white py-20">
          <div className="mx-auto max-w-6xl px-5">
            <h2 className="font-display text-3xl font-extrabold sm:text-4xl">{t.doctorsTitle}</h2>
            {doctors.length === 0 ? (
              <p className="mt-6 text-muted">{t.doctorsEmpty}</p>
            ) : (
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {doctors.map((d) => (
                  <div key={d._id} className="rounded-2xl border border-line bg-paper p-6">
                    <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-brand-tint font-display text-xl font-extrabold text-brand">
                      {(isAr ? d.nameAr : d.nameEn).replace(/^(Dr\.|د\.)\s*/, '').charAt(0)}
                    </div>
                    <h3 className="font-display text-xl font-extrabold">{isAr ? d.nameAr : d.nameEn}</h3>
                    <p className="mt-1 text-muted">{isAr ? d.specialtyAr : d.specialtyEn}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section id="book" className="mx-auto max-w-3xl px-5 py-20">
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl">{t.bookTitle}</h2>
          <p className="mb-8 mt-2 text-muted">{t.bookSub}</p>
          <Booking />
        </section>

        <section id="contact" className="bg-brand-dark py-16 text-white">
          <div className="mx-auto max-w-6xl px-5">
            <h2 className="font-display text-3xl font-extrabold">{t.contactTitle}</h2>
            <p className="mt-3 text-white/85">{t.contactHours}</p>
            <p className="mt-2 text-white/85">
              {t.contactPhone}: <span dir="ltr" className="font-bold">{PHONE}</span>
            </p>
          </div>
        </section>
      </main>

      <footer className="py-8 text-center text-sm text-muted">
        {t.footer} <Link to="/admin" className="underline">Admin</Link>
      </footer>
    </>
  );
}
