"use client";
import React, { useEffect, useState } from "react";

type Item = {
  id: number | string;
  name: string;
  category?: string;
  sizes?: string[];
  pricePerDay?: number;
};

export default function InventoryManager() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("uncategorized");
  const [sizes, setSizes] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function fetchItems() {
    setLoading(true);
    try {
      const res = await fetch("/api/items");
      const data = await res.json();
      setItems(data.items || []);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchItems();
  }, []);

  async function onCreate(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    try {
      const body = {
        name,
        category,
        sizes: sizes.split(",").map((s) => s.trim()).filter(Boolean),
        price: Number(price || 0),
      };

      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || `status ${res.status}`);
      }

      // limpiar formulario y cerrar modal
      setName("");
      setCategory("uncategorized");
      setSizes("");
      setPrice("");
      setShowModal(false);
      await fetchItems();
    } catch (e: any) {
      setError(e?.message || String(e));
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        {/* hot-reload check */}
        <h3 className="font-semibold">Inventario</h3>
        <button onClick={() => setShowModal(true)} className="rounded border px-3 py-1">Agregar item</button>
      </div>

      {loading ? (
        <div className="text-sm text-slate-500">Cargando...</div>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="py-2 pr-4">ID</th>
                <th className="py-2 pr-4">Nombre</th>
                <th className="py-2 pr-4">Categoría</th>
                <th className="py-2 pr-4">Sizes</th>
                <th className="py-2 pr-4">Precio/día</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={String(i.id)} className="border-t">
                  <td className="py-2 pr-4">{i.id}</td>
                  <td className="py-2 pr-4">{i.name}</td>
                  <td className="py-2 pr-4">{i.category}</td>
                  <td className="py-2 pr-4">{(i.sizes || []).join(", ")}</td>
                  <td className="py-2 pr-4">${i.pricePerDay}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td className="py-3 text-slate-500" colSpan={5}>Aún no hay items.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal simple, sin librerías externas */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 w-full max-w-lg">
            <h4 className="font-semibold mb-3">Crear nuevo item</h4>
            <form onSubmit={onCreate} className="grid gap-3">
              <input className="border rounded px-2 py-1" placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} required />
              <input className="border rounded px-2 py-1" placeholder="Categoría" value={category} onChange={(e) => setCategory(e.target.value)} />
              <input className="border rounded px-2 py-1" placeholder="Sizes (S,M,L)" value={sizes} onChange={(e) => setSizes(e.target.value)} />
              <input className="border rounded px-2 py-1" placeholder="Precio por día" value={price} onChange={(e) => setPrice(e.target.value)} type="number" step="0.01" />

              <div className="flex justify-end gap-2 mt-3">
                <button type="button" className="rounded border px-3 py-1" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="rounded bg-blue-600 text-white px-3 py-1">Crear</button>
              </div>
              {error && <div className="text-red-600">{error}</div>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
