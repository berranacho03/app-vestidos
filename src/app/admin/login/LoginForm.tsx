'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      if (data.success) {
        // Redirigir manualmente después de un login exitoso
        window.location.href = '/admin';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="username"
          className="block text-sm font-medium text-slate-700 mb-2"
        >
          Usuario
        </label>
        <input
          id="username"
          name="username"
          placeholder="Nombre de usuario"
          className="w-full px-4 py-3 border border-slate-300 bg-slate-50 rounded-lg text-slate-900 placeholder:text-slate-500 focus:border-slate-900 focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all outline-none"
          required
        />
      </div>
      
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-slate-700 mb-2"
        >
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Tu contraseña"
          className="w-full px-4 py-3 border border-slate-300 bg-slate-50 rounded-lg text-slate-900 placeholder:text-slate-500 focus:border-slate-900 focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all outline-none"
          required
        />
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-slate-900 text-white font-medium py-2.5 px-6 rounded-lg hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </button>

      <p className="text-xs text-slate-500 text-center">Área protegida. Solo personal autorizado.</p>
    </form>
  );
}