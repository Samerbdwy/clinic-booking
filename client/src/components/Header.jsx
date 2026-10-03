import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../i18n.jsx';

export default function Header() {
  const { t, toggle } = useLang();
  const [open, setOpen] = useState(false);
  const links = [
    ['#services', t.navServices],
    ['#doctors', t.navDoctors],
    ['#contact', t.navContact],
  ];

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link to="/" className="font-display text-lg font-extrabold text-brand-dark">
          {t.clinicName}
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
          {links.map(([href, label]) => (
            <a key={href} href={href} className="font-medium text-muted hover:text-ink">
              {label}
            </a>
          ))}
          <button onClick={toggle} className="rounded-full border border-line px-3 py-1 text-sm font-semibold hover:bg-white">
            {t.switchLang}
          </button>
          <a href="#book" className="rounded-full bg-brand px-4 py-2 font-bold text-white hover:bg-brand-dark">
            {t.navBook}
          </a>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <button onClick={toggle} className="rounded-full border border-line px-3 py-1 text-sm font-semibold">
            {t.switchLang}
          </button>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label="Menu"
            className="grid h-10 w-10 place-items-center rounded-lg border border-line"
          >
            <span className="flex flex-col gap-1" aria-hidden="true">
              <span className="block h-0.5 w-5 bg-ink" />
              <span className="block h-0.5 w-5 bg-ink" />
              <span className="block h-0.5 w-5 bg-ink" />
            </span>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-line bg-paper px-5 pb-4 md:hidden" aria-label="Mobile">
          {links.map(([href, label]) => (
            <a key={href} href={href} onClick={() => setOpen(false)} className="block border-b border-line py-3 font-medium">
              {label}
            </a>
          ))}
          <a href="#book" onClick={() => setOpen(false)} className="mt-3 block rounded-full bg-brand py-3 text-center font-bold text-white">
            {t.navBook}
          </a>
        </nav>
      )}
    </header>
  );
}
