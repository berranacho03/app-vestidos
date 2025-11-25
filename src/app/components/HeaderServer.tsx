import Link from "next/link";
import { isUserAuthenticatedServer } from "../../../lib/serverAuth";
import LogoutButton from "./LogoutButton";

export default async function Header() {
  const isLoggedIn = await isUserAuthenticatedServer();

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
          {isLoggedIn ? (
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
              <Link href="/login" className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:hidden text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="hidden sm:inline text-sm hover:text-fuchsia-600">Iniciar sesión</span>
              </Link>
              <Link href="/admin/login" className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:hidden text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l2 4 4 .5-3 2 1.2 4L12 12l-4.2 1.5L9 9 6 7l4-.5L12 2z" />
                </svg>
                <span className="hidden sm:inline text-sm hover:text-fuchsia-600">Admin</span>
              </Link>
              <Link href="/register" className="inline-flex items-center rounded-full bg-fuchsia-600 text-white px-3 py-2 text-sm font-medium hover:bg-fuchsia-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 21v-2a4 4 0 014-4h0" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 17v6" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 20h6" />
                </svg>
                <span className="hidden sm:inline">Convertite en GlamUser</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
