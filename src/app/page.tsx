import Image from "next/image";
import Link from "next/link";
import HeaderServer from "./components/HeaderServer";
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

              <form action="/search" method="GET" className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-4 shadow-sm">
                <div className="col-span-1 lg:col-span-2">
                  <label htmlFor="query" className="sr-only">Search</label>
                  <input
                    id="query"
                    name="q"
                    type="text"
                    placeholder="Buscar por estilo, color, nombre..."
                    className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500"
                  />
                </div>
                <div>
                  <label htmlFor="start" className="sr-only">Fecha de inicio</label>
                  <input
                    id="start"
                    name="start"
                    type="date"
                    className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500"
                  />
                </div>
                <div>
                  <label htmlFor="end" className="sr-only">Fecha de fin</label>
                  <input
                    id="end"
                    name="end"
                    type="date"
                    className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500"
                  />
                </div>
                <div>
                  <label htmlFor="size" className="sr-only">Size</label>
                  <select
                    id="size"
                    name="size"
                    className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500"
                  >
                    <option value="">Cualquier talla</option>
                    <option>XS</option>
                    <option>S</option>
                    <option>M</option>
                    <option>L</option>
                    <option>XL</option>
                  </select>
                </div>
                <div className="lg:col-span-5">
                  <button
                    type="submit"
                    className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-fuchsia-600 px-6 py-3 text-sm font-semibold text-white hover:bg-fuchsia-500 transition-colors"
                  >
                    Buscar vestidos
                  </button>
                </div>
              </form>
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
                      From ${item.price}/day
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
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {steps.map((s, i) => (
                <div key={i} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-center">
                  <div className="mx-auto h-12 w-12 rounded-full bg-fuchsia-600/10 flex items-center justify-center text-2xl">{s.emoji}</div>
                  <h3 className="mt-4 font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{s.text}</p>
                </div>
              ))}
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
