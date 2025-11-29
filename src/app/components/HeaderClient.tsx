"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import LogoutButton from './LogoutButton';

export default function HeaderClient() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/auth/status');
        const data = await res.json();
        if (mounted) setIsLoggedIn(Boolean(data?.isLoggedIn));
      } catch (err) {
        if (mounted) setIsLoggedIn(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // While loading, render a neutral header
  const logged = isLoggedIn === null ? false : isLoggedIn;

  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-white/70 dark:bg-slate-950/60 border-b border-slate-200/60 dark:border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-extrabold sm:hidden">GR</span>
          <span className="hidden sm:inline font-extrabold text-xl tracking-tight">GlamRent</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <Link href="/search" className="hover:text-fuchsia-600">Catálogo</Link>
          <Link href="#how" className="hover:text-fuchsia-600">Funcionamiento</Link>
          <Link href="#Destacados" className="hover:text-fuchsia-600">Destacados</Link>
          <Link href="/faq" className="hover:text-fuchsia-600">FAQ</Link>
        </nav>
        <div className="flex items-center gap-3">
          {logged ? (
            <>
              <Link href="/admin/login" className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:hidden text-slate-700" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path d="M10 2a4 4 0 100 8 4 4 0 000-8z" />
                  <path fillRule="evenodd" d="M2 18a6 6 0 0116 0H2z" clipRule="evenodd" />
                </svg>
                <span className="hidden sm:inline text-sm hover:text-fuchsia-600">Admin</span>
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/admin/login" className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:hidden text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l2 4 4 .5-3 2 1.2 4L12 12l-4.2 1.5L9 9 6 7l4-.5L12 2z" />
                </svg>
                <span className="hidden sm:inline text-sm hover:text-fuchsia-600">Admin</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
