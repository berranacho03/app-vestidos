"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay una cookie de sesión
    const checkAuth = () => {
      const cookies = document.cookie.split(';');
      const hasUserToken = cookies.some(cookie => cookie.trim().startsWith('user_token='));
      setIsLoggedIn(hasUserToken);
      setLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setIsLoggedIn(false);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

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
          {!loading && (
            <>
              {isLoggedIn ? (
                <>
                  <Link href="/admin/login" className="text-sm hover:text-fuchsia-600">Admin</Link>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center rounded-full bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800"
                  >
                    Cerrar sesión
                  </button>
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
            </>
          )}
        </div>
      </div>
    </header>
  );
}
