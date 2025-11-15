import Link from "next/link";
import { isUserAuthenticatedServer } from "../../../lib/serverAuth";
import LogoutButton from "./LogoutButton";

export default async function Header() {
  const isLoggedIn = await isUserAuthenticatedServer();

  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-white/70 dark:bg-slate-950/60 border-b border-slate-200/60 dark:border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="font-extrabold text-xl tracking-tight">
          GlamRent
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <Link href="/search" className="hover:text-fuchsia-600">Browse</Link>
          <Link href="#how" className="hover:text-fuchsia-600">How it works</Link>
          <Link href="#featured" className="hover:text-fuchsia-600">Featured</Link>
          <Link href="/faq" className="hover:text-fuchsia-600">FAQ</Link>
        </nav>
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <Link href="/admin/login" className="text-sm hover:text-fuchsia-600">Admin</Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm hover:text-fuchsia-600">Iniciar sesión</Link>
              <Link href="/admin/login" className="text-sm hover:text-fuchsia-600">Admin</Link>
              <Link href="/register" className="inline-flex items-center rounded-full bg-fuchsia-600 text-white px-4 py-2 text-sm font-medium hover:bg-fuchsia-500">
                Become a lender
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
