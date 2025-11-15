"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error al registrarse");
        setLoading(false);
        return;
      }

      // Registro exitoso, redirigir al login
      router.push("/login?registered=true");
    } catch (err) {
      setError("Error de conexión. Intenta nuevamente.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-slate-900">Crear cuenta</h1>
            <p className="text-slate-500 text-sm mt-1">
              Regístrate para poder alquilar vestidos
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Nombre completo
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 border border-slate-300 bg-slate-50 rounded-lg text-slate-900 placeholder:text-slate-500 focus:border-slate-900 focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all outline-none"
                placeholder="Tu nombre"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 border border-slate-300 bg-slate-50 rounded-lg text-slate-900 placeholder:text-slate-500 focus:border-slate-900 focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all outline-none"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Teléfono <span className="text-slate-400">(opcional)</span>
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-3 border border-slate-300 bg-slate-50 rounded-lg text-slate-900 placeholder:text-slate-500 focus:border-slate-900 focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all outline-none"
                placeholder="099 123 456"
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
                type="password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-3 border border-slate-300 bg-slate-50 rounded-lg text-slate-900 placeholder:text-slate-500 focus:border-slate-900 focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all outline-none"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Confirmar contraseña
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className="w-full px-4 py-3 border border-slate-300 bg-slate-50 rounded-lg text-slate-900 placeholder:text-slate-500 focus:border-slate-900 focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all outline-none"
                placeholder="Repite tu contraseña"
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
              {loading ? "Registrando..." : "Crear cuenta"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-600 text-sm">
              ¿Ya tienes cuenta?{" "}
              <Link
                href="/login"
                className="text-slate-900 hover:underline font-medium"
              >
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
