'use client'

import { useState } from 'react'
import Link from 'next/link'

interface FilterCardProps {
  q: string
  category: string
  size: string
  color: string
  style: string
  getFilterUrl: (filters: Record<string, string>) => string
}

export default function FilterCard({ 
  q, 
  category, 
  size, 
  color, 
  style, 
  getFilterUrl 
}: FilterCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 mb-8">
      <div className="border-b border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Filtros de búsqueda</h3>
              <p className="text-slate-500 text-sm mt-1">Encuentra exactamente lo que buscas</p>
            </div>
            
            {/* Botón para expandir/contraer */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all border border-slate-300"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              {isExpanded ? 'Contraer' : 'Expandir'}
            </button>
          </div>
          
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all border border-slate-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Limpiar filtros
          </Link>
        </div>
      </div>
      
      {/* Contenido expandible de los filtros */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
        isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
      }`}>        
        <form method="GET" className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Búsqueda general</label>
              <input 
                name="q" 
                defaultValue={q} 
                placeholder="Buscar por nombre, color, estilo..." 
                className="w-full rounded-lg border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-500 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200 focus:bg-white transition-all outline-none" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Categoría</label>
              <select 
                name="category" 
                defaultValue={category} 
                className="w-full rounded-lg border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200 focus:bg-white transition-all outline-none"
              >
                <option value="">Todas las categorías</option>
                <option value="dress">Vestidos</option>
                <option value="shoes">Zapatos</option>
                <option value="bag">Bolsos</option>
                <option value="jacket">Chaquetas</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Talla</label>
              <input 
                name="size" 
                defaultValue={size} 
                placeholder="Ej: S, M, L, XL" 
                className="w-full rounded-lg border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-500 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200 focus:bg-white transition-all outline-none" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Color</label>
              <input 
                name="color" 
                defaultValue={color} 
                placeholder="Ej: rojo, azul, negro" 
                className="w-full rounded-lg border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-500 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200 focus:bg-white transition-all outline-none" 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Estilo</label>
              <input 
                name="style" 
                defaultValue={style} 
                placeholder="Ej: elegante, casual, formal" 
                className="w-full rounded-lg border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-500 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200 focus:bg-white transition-all outline-none" 
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-fuchsia-600 text-white font-medium hover:bg-fuchsia-700 focus:ring-2 focus:ring-fuchsia-200 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Buscar artículos
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}