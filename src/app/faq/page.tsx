import Link from 'next/link';
import { FAQList } from './FAQList';

const faqs = [
  {
    question: "¿Cómo funciona el proceso de alquiler?",
    answer: (
      <div className="space-y-2">
        <p>El proceso es simple:</p>
        <ol className="list-decimal list-inside space-y-1 pl-4">
          <li>Busca el vestido o accesorio que te gusta</li>
          <li>Selecciona las fechas de alquiler</li>
          <li>Realiza la reserva</li>
          <li>Recibe el artículo en tu domicilio</li>
          <li>Devuélvelo al finalizar el período (la limpieza está incluida)</li>
        </ol>
      </div>
    ),
  },
  {
    question: "¿Qué incluye el precio del alquiler?",
    answer: "El precio incluye el alquiler del artículo, envío a domicilio, seguro básico y limpieza profesional después de la devolución.",
  },
  {
    question: "¿Cuánto tiempo puedo alquilar un artículo?",
    answer: "Ofrecemos alquileres de hasta 5 días. Para períodos más largos, por favor contáctanos directamente.",
  },
  {
    question: "¿Qué pasa si el artículo no me queda bien?",
    answer: "Recomendamos revisar detalladamente las medidas antes de alquilar. Sin embargo, si el artículo no te queda bien, contáctanos dentro de las primeras 24 horas tras recibirlo y buscaremos una solución.",
  },
  {
    question: "¿Cómo funciona la devolución?",
    answer: "El proceso de devolución es simple: coloca el artículo en la bolsa de devolución proporcionada y usa la etiqueta prepagada. No es necesario limpiar el artículo, ¡nosotros nos encargamos de eso!",
  },
  {
    question: "¿Qué métodos de pago aceptan?",
    answer: "Aceptamos todas las tarjetas de crédito/débito principales y transferencias bancarias.",
  },
  {
    question: "¿Qué sucede si daño el artículo?",
    answer: "Todos los alquileres incluyen un seguro básico que cubre el desgaste normal. Para daños significativos, se aplicará un cargo según la política de protección del artículo.",
  },
  {
    question: "¿Hacen envíos a todo el país?",
    answer: "Sí, realizamos envíos a todo el territorio nacional. Los tiempos de entrega pueden variar según la ubicación.",
  }
];

export default function FAQPage() {

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900 dark:from-slate-950 dark:to-slate-900 dark:text-slate-100">
      <header className="sticky top-0 z-30 backdrop-blur bg-white/70 dark:bg-slate-950/60 border-b border-slate-200/60 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="font-extrabold text-xl tracking-tight">
            GlamRent
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <Link href="/search" className="hover:text-fuchsia-600">Catálogo</Link>
            <Link href="/#how" className="hover:text-fuchsia-600">Funcionamiento</Link>
            <Link href="/faq" className="hover:text-fuchsia-600">FAQ</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold">Preguntas Frecuentes</h1>
        <p className="mt-4 text-slate-600 dark:text-slate-400">
          Encuentra respuestas a las preguntas más comunes sobre nuestro servicio de alquiler.
        </p>

        <FAQList faqs={faqs} />
      </main>
    </div>
  );
}