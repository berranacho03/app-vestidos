import Image from "next/image";
import { notFound } from "next/navigation";
import {getItem, getItemRentals} from "../../../../lib/RentalManagementSystem";
import ItemCalendar from "./ItemCalendar";
import {getOrCreateCsrfToken} from "../../../../lib/CsrfSessionManagement";
import { isUserAuthenticatedServer, getCurrentUserServer, getFullUserInfoServer } from "../../../../lib/serverAuth";
import Link from "next/link";
import { StaticImport } from "next/dist/shared/lib/get-img-props";
import { Key } from "react";
import RentalForm from "./RentalForm";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function ItemDetail({ params }: any) {
  const id = Number(params.id);
    const item = await getItem(id);
    if (!item) return notFound();

  // Genera token CSRF; se establecerá la cookie si falla
    const csrf = await getOrCreateCsrfToken();

    const booked = await getItemRentals(id);
    
    // Verificar si el usuario está autenticado
    const isAuthenticated = await isUserAuthenticatedServer();
    const currentUser = await getCurrentUserServer();
    const fullUserInfo = await getFullUserInfoServer();

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
            {/* Header con botón de volver */}
            <div className="mb-8">
                <Link 
                    href="/search" 
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
                    <span className="text-sm font-medium">Volver al catálogo</span>
                </Link>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <Image src={item.images[0]} alt={item.alt} fill className="object-cover" priority/>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-3">
                        {item.images.slice(1).map((src: Key | StaticImport | null | undefined) => (
                            <div key={`${src}-${item.id}`}
                                 className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                                <Image src={src as StaticImport} alt={item.alt} fill className="object-cover"/>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{item.name}</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400 capitalize">{item.category}</p>
          <p className="mt-4">{item.description}</p>
          <p className="mt-4 font-semibold">Desde ${item.pricePerDay}/día</p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Tallas: {item.sizes.join(", ")}</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Color: {item.color}{item.style ? ` • Estilo: ${item.style}` : ""}</p>

          <div className="mt-8">
            <h2 className="font-semibold mb-3">Disponibilidad</h2>
            <ItemCalendar itemId={id} />
            {booked.length > 0 && (
              <p className="mt-2 text-xs text-slate-500">Las fechas marcadas ya están reservadas.</p>
            )}
          </div>

          <div className="mt-10">
            <h2 className="font-semibold mb-3">Programar un alquiler</h2>
            <RentalForm 
              itemId={id}
              csrf={csrf}
              isAuthenticated={isAuthenticated}
              fullUserInfo={fullUserInfo}
            />
            <p className="mt-2 text-xs text-slate-500">
              {isAuthenticated 
                ? "Tu solicitud de alquiler será procesada inmediatamente con la información de tu cuenta." 
                : "No se requiere cuenta. Confirmaremos disponibilidad y te contactaremos por email."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
