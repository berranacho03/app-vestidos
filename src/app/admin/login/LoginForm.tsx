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
    <form onSubmit={handleSubmit} className="mt-6 grid gap-3 rounded-2xl border p-4">
      <input
        name="username"
        placeholder="Username"
        className="rounded-xl border px-4 py-3 text-sm"
        required
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        className="rounded-xl border px-4 py-3 text-sm"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className={`rounded-xl bg-fuchsia-600 text-white px-4 py-3 text-sm font-semibold ${
          loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-fuchsia-700'
        }`}
      >
        {loading ? 'Iniciando sesión...' : 'Sign in'}
      </button>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <p className="text-xs text-slate-500">Protected area. Authorized staff only.</p>
    </form>
  );
}