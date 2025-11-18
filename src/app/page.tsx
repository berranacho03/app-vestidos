import Image from "next/image";
import Link from "next/link";
import HeaderServer from "./components/HeaderServer";
import HowCarousel from "./components/HowCarousel";
import { listItems } from "../../lib/RentalManagementSystem";

export default async function Home() {
  // Obtener los primeros 4 artículos de la base de datos
  const allItems = await listItems();
  const Destacados = allItems.slice(0, 4).map(item => ({
    id: item.id,
    name: item.name,
    price: item.pricePerDay,
    image: item.images[0] || "https://images.unsplash.com/photo-1566174043461-d5b6b3d63edb?w=400&h=600&fit=crop",
    alt: item.alt
  }));

  const steps = [
    {
      emoji: "🔎",
      title: "Explora el catálogo",
      text: "Busca por talla, color, diseñador u ocasión. Usa los filtros y el calendario para ver disponibilidad en tus fechas y guarda los favoritos.",
    },
    {
      emoji: "🗓️",
      title: "Reserva y paga",
      text: "Selecciona las fechas de alquiler y la talla, añade el vestido al carrito y completa el pago seguro. Recibirás confirmación y los detalles de la reserva.",
    },
    {
      emoji: "🚚",
      title: "Entrega, uso y devolución",
      text: "Recibe el vestido en la fecha acordada, úsalo y devuélvelo según las instrucciones (bolsa prepagada). Nosotros nos encargamos de la limpieza.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900 dark:from-slate-950 dark:to-slate-900 dark:text-slate-100">
      <HeaderServer />

      <main>
        <section className="relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
            <div className="max-w-3xl">
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
                Rentá vestidos de diseñador para cada
                <span className="mx-2 bg-gradient-to-r from-fuchsia-600 via-rose-500 to-orange-400 bg-clip-text text-transparent">ocasión</span>.
              </h1>
              <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300">
                Lucí de manera espectacular sin pagar un precio elevado.
              </p>

              {/* Card de filtros */}
              <div className="mt-8 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="border-b border-slate-200 dark:border-slate-800 p-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Filtros de búsqueda</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Encuentra exactamente lo que buscas</p>
                  </div>
                </div>
                
                <form action="/search" method="GET" className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <div className="lg:col-span-3">
                      <label htmlFor="query" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Búsqueda general</label>
                      <input
                        id="query"
                        name="q"
                        type="text"
                        placeholder="Buscar por nombre, color, estilo..."
                        className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="start" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Fecha inicio</label>
                      <input
                        id="start"
                        name="start"
                        type="date"
                        className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-slate-100 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="end" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Fecha fin</label>
                      <input
                        id="end"
                        name="end"
                        type="date"
                        className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-slate-100 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="size" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Talla</label>
                      <input
                        id="size"
                        name="size"
                        type="text"
                        placeholder="Ej: S, M, L, XL"
                        className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label htmlFor="minPrice" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Precio mínimo ($/día)</label>
                      <input
                        id="minPrice"
                        name="minPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Ej: 10.00"
                        className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="maxPrice" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Precio máximo ($/día)</label>
                      <input
                        id="maxPrice"
                        name="maxPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Ej: 100.00"
                        className="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
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
          </div>
        </section>

        <section id="Destacados" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold">Selección destacada</h2>
            <Link href="/search" className="text-sm text-fuchsia-600 hover:underline transition-colors">Ver todo →</Link>
          </div>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Destacados.map((item) => (
              <div
                key={item.id}
                className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-[3/4] relative bg-slate-100 dark:bg-slate-800">
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover"
                    priority={item.id === 1}
                  />
                  <div className="absolute inset-0 flex items:end p-4">
                    <span className="inline-flex items-center rounded-full bg-white/85 dark:bg-slate-800/80 backdrop-blur px-2.5 py-1 text-xs font-medium text-slate-800 dark:text-slate-100">
                      Desde ${item.price}/día
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="font-medium">{item.name}</p>
                  <div className="mt-4">
                    <Link
                      href={`/items/${item.id}`}
                      className="inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      Ver detalles
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="how" className="bg-slate-50/70 dark:bg-slate-900/60 border-y border-slate-200/60 dark:border-slate-800">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-center">Funcionamiento</h2>
            <div className="mt-10">
              {/* Carousel for mobile: show one at a time */}
              <div className="sm:hidden">
                <HowCarousel steps={steps} />
              </div>

              {/* Grid for larger screens */}
              <div className="hidden sm:grid grid-cols-3 gap-6">
                {steps.map((s, i) => (
                  <div key={i} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-center">
                    <div className="mx-auto h-12 w-12 rounded-full bg-fuchsia-600/10 flex items-center justify-center text-2xl">{s.emoji}</div>
                    <h3 className="mt-4 font-semibold">{s.title}</h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{s.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-sm text-slate-600 dark:text-slate-400">© {new Date().getFullYear()} GlamRent. Todos los derechos reservados.</p>
          <div className="flex gap-6 text-sm">
            <Link href="/terms" className="hover:text-fuchsia-600">Términos</Link>
            <Link href="/privacy" className="hover:text-fuchsia-600">Privacidad</Link>
            <Link href="/contact" className="hover:text-fuchsia-600">Contacto</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
