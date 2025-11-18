import Link from "next/link";
import Image from "next/image";
import {listItems, type Category, getItemRentals, hasOverlap} from "../../../lib/RentalManagementSystem";

type SearchParams = {
  q?: string;
  size?: string;
  start?: string;
  end?: string;
  minPrice?: string;
  maxPrice?: string;
};

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const { q = "", size = "", start = "", end = "", minPrice = "", maxPrice = "" } = searchParams;
  let items = await listItems({
    q,
    size: size || undefined,
  });

  // Filtrar por precio
  if (minPrice) {
    const min = parseFloat(minPrice);
    items = items.filter(item => item.pricePerDay >= min);
  }
  if (maxPrice) {
    const max = parseFloat(maxPrice);
    items = items.filter(item => item.pricePerDay <= max);
  }

  // Filtrar por disponibilidad en fechas
  if (start && end) {
    const availableItems = [];
    for (const item of items) {
      const rentals = await getItemRentals(item.id);
      const isAvailable = rentals.every((r) => !hasOverlap(start, end, r.start, r.end));
      if (isAvailable) {
        availableItems.push(item);
      }
    }
    items = availableItems;
  }

  // Helper para crear URLs de filtros
  const getFilterUrl = (removeParam: string) => {
    const params: Record<string, string> = {};
    if (q && removeParam !== 'q') params.q = q;
    if (size && removeParam !== 'size') params.size = size;
    // Si estamos removiendo 'start' o 'end', remover ambos
    if (start && removeParam !== 'start' && removeParam !== 'end') params.start = start;
    if (end && removeParam !== 'start' && removeParam !== 'end') params.end = end;
    // Si estamos removiendo minPrice o maxPrice, remover ambos
    if (minPrice && removeParam !== 'minPrice' && removeParam !== 'maxPrice') params.minPrice = minPrice;
    if (maxPrice && removeParam !== 'minPrice' && removeParam !== 'maxPrice') params.maxPrice = maxPrice;
    
    const urlParams = new URLSearchParams(params);
    return `/search${urlParams.toString() ? '?' + urlParams.toString() : ''}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header con botón de volver */}
      <div className="mb-8">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 hover:bg-white hover:shadow-sm transition-all duration-200 text-slate-700 hover:text-slate-900"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">Volver al inicio</span>
        </Link>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold mb-8">Explorar catálogo</h1>
      
      {/* Card de filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 mb-8">
        <div className="border-b border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Filtros de búsqueda</h3>
              <p className="text-slate-500 text-sm mt-1">Encuentra exactamente lo que buscas</p>
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
        
        <form method="GET" className="p-6" key={`${q}-${size}-${start}-${end}-${minPrice}-${maxPrice}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-slate-700 mb-2">Búsqueda general</label>
              <input 
                name="q" 
                defaultValue={q} 
                placeholder="Buscar por nombre, color, estilo..." 
                className="w-full rounded-lg border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-500 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200 focus:bg-white transition-all outline-none" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Fecha inicio</label>
              <input 
                name="start" 
                type="date"
                defaultValue={start} 
                className="w-full rounded-lg border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200 focus:bg-white transition-all outline-none" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Fecha fin</label>
              <input 
                name="end" 
                type="date"
                defaultValue={end} 
                className="w-full rounded-lg border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200 focus:bg-white transition-all outline-none" 
              />
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
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Precio mínimo ($/día)</label>
              <input 
                name="minPrice" 
                type="number"
                step="0.01"
                min="0"
                defaultValue={minPrice} 
                placeholder="Ej: 10.00" 
                className="w-full rounded-lg border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-500 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200 focus:bg-white transition-all outline-none" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Precio máximo ($/día)</label>
              <input 
                name="maxPrice" 
                type="number"
                step="0.01"
                min="0"
                defaultValue={maxPrice} 
                placeholder="Ej: 100.00" 
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

      {/* Indicadores de filtros activos */}
      {(q || size || start || end || minPrice || maxPrice) && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <h4 className="text-sm font-medium text-slate-700">Filtros activos:</h4>
            <Link
              href="/search"
              className="text-xs text-fuchsia-600 hover:text-fuchsia-700 font-medium"
            >
              Limpiar todos
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {q && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-fuchsia-100 text-fuchsia-800">
                Búsqueda: "{q}"
                <Link href={getFilterUrl('q')} className="hover:text-fuchsia-900">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </span>
            )}
            {size && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Talla: {size}
                <Link href={getFilterUrl('size')} className="hover:text-green-900">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </span>
            )}
            {(start || end) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800">
                Fechas: {start || '...'} - {end || '...'}
                <Link href={getFilterUrl('start')} className="hover:text-cyan-900">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </span>
            )}
            {(minPrice || maxPrice) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                Precio: ${minPrice || '0'} - ${maxPrice || '∞'}
                <Link href={getFilterUrl('minPrice')} className="hover:text-emerald-900">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Resultados */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-slate-600">
          {items.length === 0 ? 'No se encontraron artículos' : 
           items.length === 1 ? '1 artículo encontrado' : 
           `${items.length} artículos encontrados`}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((it) => (
          <div key={it.id} className="rounded-2xl border bg-white dark:bg-slate-900 overflow-hidden">
            <div className="relative aspect-[3/4] bg-slate-100 dark:bg-slate-800">
              <Image src={it.images[0]} alt={it.alt} fill className="object-cover" />
              <div className="absolute inset-0 flex items-end p-3">
                <span className="rounded-full bg-white/85 dark:bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-slate-800 dark:text-slate-100">
                  From ${it.pricePerDay}/day
                </span>
              </div>
            </div>
            <div className="p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                {it.category === 'dress' ? 'Vestido' : 
                 it.category === 'shoes' ? 'Zapatos' : 
                 it.category === 'bag' ? 'Bolso' : 
                 it.category === 'jacket' ? 'Chaqueta' : it.category}
              </p>
              <p className="font-medium">{it.name}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Tallas: {it.sizes.join(", ")}</p>
              <div className="mt-3">
                <Link href={`/items/${it.id}`} className="text-sm rounded-lg border px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  Ver detalles
                </Link>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-lg border border-slate-200">
            <p className="text-lg text-slate-900 mb-2 font-medium">No se encontraron artículos</p>
            <p className="text-sm text-slate-600">Intenta ajustar tus filtros de búsqueda</p>
          </div>
        )}
      </div>
    </div>
  );
}
