"use client";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

type Item = {
  id: number | string;
  name: string;
  category?: string;
  sizes?: string[];
  pricePerDay?: number;
};

const categoryTranslations: Record<string, string> = {
  dress: "Vestido",
  shoes: "Zapatos",
  bag: "Bolso",
  jacket: "Chaqueta",
};

export default function InventoryManager() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("dress");
  const [sizes, setSizes] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | string | null>(null);

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

  function openEditModal(item: Item) {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category || "dress");
    setSizes((item.sizes || []).join(", "));
    setPrice(String(item.pricePerDay || ""));
    setShowModal(true);
    setOpenMenuId(null);
  }

  function openCreateModal() {
    setEditingItem(null);
    setName("");
    setCategory("dress");
    setSizes("");
    setPrice("");
    setShowModal(true);
  }

  async function onSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    try {
      const body = {
        name,
        category,
        sizes: sizes.split(",").map((s) => s.trim()).filter(Boolean),
        price: Number(price || 0),
      };

      const url = editingItem ? `/api/items/${editingItem.id}` : "/api/items";
      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || `status ${res.status}`);
      }

      // limpiar formulario y cerrar modal
      setName("");
      setCategory("dress");
      setSizes("");
      setPrice("");
      setEditingItem(null);
      setShowModal(false);
      await fetchItems();
      
      Swal.fire({
        icon: "success",
        title: editingItem ? "Item actualizado" : "Item creado",
        text: editingItem ? "El item se actualizó correctamente" : "El item se agregó correctamente",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (e: any) {
      setError(e?.message || String(e));
    }
  }

  async function onDelete(id: number | string) {
    setOpenMenuId(null);
    
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "No podrás revertir esta acción",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`/api/items/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || `status ${res.status}`);
      }

      await fetchItems();
      
      Swal.fire({
        icon: "success",
        title: "Eliminado",
        text: "El item se eliminó correctamente",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (e: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: e?.message || String(e),
      });
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-semibold text-slate-900">Gestión de Inventario</h3>
            <p className="text-slate-500 text-sm mt-1">Administra tus productos</p>
          </div>
          <button 
            onClick={openCreateModal} 
            className="bg-slate-900 text-white hover:bg-slate-800 font-medium rounded-lg px-5 py-2.5 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Agregar Item
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-slate-500">Cargando inventario...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Vista de tabla para desktop */}
          <div className="hidden md:block bg-white rounded-lg shadow-sm border border-slate-200">
            <table className="min-w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Categoría</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Tallas</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Precio/día</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider w-24">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((i, idx) => (
                  <tr key={String(i.id)} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-semibold text-sm">
                        {i.id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{i.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {categoryTranslations[i.category || ''] || i.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(i.sizes || []).map((size, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                            {size}
                          </span>
                        ))}
                        {(!i.sizes || i.sizes.length === 0) && (
                          <span className="text-slate-400 text-sm">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-bold text-green-600">${i.pricePerDay}</span>
                    </td>
                    <td className="px-6 py-4 text-center relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === i.id ? null : i.id)}
                        className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-slate-600 hover:bg-slate-100 transition-all"
                        title="Opciones"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                      
                      {openMenuId === i.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
                            <button
                              onClick={() => openEditModal(i)}
                              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                              Editar
                            </button>
                            <button
                              onClick={() => onDelete(i.id)}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              Eliminar
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td className="px-6 py-12 text-center text-slate-500" colSpan={6}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-lg font-medium">No hay items en el inventario</p>
                      <p className="text-sm mt-1">Comienza agregando tu primer producto</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Vista de cards para móvil */}
          <div className="md:hidden space-y-4">
            {items.map((i) => (
              <div key={String(i.id)} className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 text-purple-600 font-semibold text-sm">
                      {i.id}
                    </span>
                    <div>
                      <h4 className="font-semibold text-slate-900">{i.name}</h4>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                        {categoryTranslations[i.category || ''] || i.category}
                      </span>
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === i.id ? null : i.id)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-600 hover:bg-slate-100 transition-all"
                      title="Opciones"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                    
                    {openMenuId === i.id && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setOpenMenuId(null)}
                        />
                        <div className="absolute right-0 top-10 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
                          <button
                            onClick={() => openEditModal(i)}
                            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                            Editar
                          </button>
                          <button
                            onClick={() => onDelete(i.id)}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Eliminar
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Tallas disponibles</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(i.sizes || []).map((size, idx) => (
                        <span key={idx} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                          {size}
                        </span>
                      ))}
                      {(!i.sizes || i.sizes.length === 0) && (
                        <span className="text-slate-400 text-sm">Sin tallas</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Precio por día</span>
                    <span className="text-xl font-bold text-green-600">${i.pricePerDay}</span>
                  </div>
                </div>
              </div>
            ))}
            
            {items.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-lg font-medium text-slate-500">No hay items en el inventario</p>
                <p className="text-sm text-slate-400 mt-1">Comienza agregando tu primer producto</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg transform transition-all border border-slate-200">
            <div className="border-b border-slate-200 p-6">
              <h4 className="text-xl font-semibold text-slate-900">{editingItem ? "Editar Item" : "Crear Nuevo Item"}</h4>
              <p className="text-sm text-slate-500 mt-1">{editingItem ? "Modifica la información del producto" : "Completa la información del producto"}</p>
            </div>
            
            <form onSubmit={onSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nombre del producto</label>
                <input 
                  className="w-full border border-slate-300 bg-slate-50 rounded-lg px-4 py-3 text-slate-900 focus:border-slate-900 focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all outline-none" 
                  placeholder="Ej: Vestido de noche elegante" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Categoría</label>
                <select 
                  className="w-full border border-slate-300 bg-slate-50 rounded-lg px-4 py-3 text-slate-900 focus:border-slate-900 focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all outline-none" 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)} 
                  required
                >
                  <option value="dress">Vestido</option>
                  <option value="shoes">Zapatos</option>
                  <option value="bag">Bolso</option>
                  <option value="jacket">Chaqueta</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tallas disponibles</label>
                <input 
                  className="w-full border border-slate-300 bg-slate-50 rounded-lg px-4 py-3 text-slate-900 focus:border-slate-900 focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all outline-none" 
                  placeholder="S, M, L, XL" 
                  value={sizes} 
                  onChange={(e) => setSizes(e.target.value)} 
                />
                <p className="text-xs text-slate-500 mt-1">Separa las tallas con comas</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Precio por día</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-600 font-medium">$</span>
                  <input 
                    className="w-full border border-slate-300 bg-slate-50 rounded-lg pl-8 pr-4 py-3 text-slate-900 focus:border-slate-900 focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all outline-none" 
                    placeholder="0.00" 
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)} 
                    type="number" 
                    step="0.01" 
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  className="flex-1 border border-slate-300 rounded-lg px-6 py-2.5 font-medium text-slate-700 hover:bg-slate-50 transition-all" 
                  onClick={() => {
                    setShowModal(false);
                    setEditingItem(null);
                  }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-slate-900 text-white rounded-lg px-6 py-2.5 font-medium hover:bg-slate-800 transition-all"
                >
                  {editingItem ? "Actualizar Item" : "Crear Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
