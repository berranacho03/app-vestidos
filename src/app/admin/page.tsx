import { isAuthenticatedServer } from "@/lib/serverAuth";
import { listRentals } from "@/lib/RentalManagementSystem";
import { redirect } from "next/navigation";
import InventoryManager from "./InventoryManager";
import CancelRentalButton from "./CancelRentalButton";

type AdminItem = {
  id: number | string;
  name: string;
  category: string;
  sizes: string[];
  pricePerDay: number;
};

export default async function Page() {
  if (!(await isAuthenticatedServer())) redirect("/admin/login");

  const rentals = await listRentals();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* test: trigger hot reload */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Panel de administración</h1>
        <form action="/api/admin/logout" method="POST">
          <button className="text-sm rounded-lg border px-3 py-2">Cerrar sesión</button>
        </form>
      </div>

      <section className="mt-8">
        <div className="mt-4">
          <InventoryManager />
        </div>
      </section>

      <section className="mt-10">
        {/* Header Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-semibold text-slate-900">Alquileres programados</h3>
              <p className="text-slate-500 text-sm mt-1">Gestiona las reservas de tus clientes</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-fuchsia-600">{rentals.length}</div>
              <p className="text-slate-500 text-sm">Total alquileres</p>
            </div>
          </div>
        </div>

        {/* Vista de tabla para desktop */}
        <div className="hidden md:block bg-white rounded-lg shadow-sm border border-slate-200">
          <table className="min-w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">ID Alquiler</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Artículo</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Fechas</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider w-24">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rentals.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-fuchsia-100 text-fuchsia-600 font-semibold text-sm">
                      {r.id.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="ml-2 text-sm text-slate-600">#{r.id.slice(0, 8)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">Artículo #{r.itemId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">
                      {typeof r.start === 'string' ? r.start : r.start.toISOString().slice(0, 10)} 
                      <span className="text-slate-400 mx-2">→</span>
                      {typeof r.end === 'string' ? r.end : r.end.toISOString().slice(0, 10)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{r.customer.name}</div>
                    <div className="text-slate-500 text-sm">{r.customer.email}</div>
                    <div className="text-slate-500 text-sm">{r.customer.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${
                      r.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : r.status === 'canceled'
                        ? 'bg-red-100 text-red-800'
                        : r.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      {r.status === 'active' ? 'Activo' : r.status === 'canceled' ? 'Cancelado' : r.status === 'pending' ? 'Pendiente' : r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <CancelRentalButton rentalId={r.id} status={r.status} />
                  </td>
                </tr>
              ))}
              {rentals.length === 0 && (
                <tr>
                  <td className="px-6 py-12 text-center text-slate-500" colSpan={6}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h8a2 2 0 012 2v4h-2V3H10v4H8zM6 7h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2z" />
                    </svg>
                    <p className="text-lg font-medium">No hay alquileres programados</p>
                    <p className="text-sm mt-1">Los alquileres aparecerán aquí cuando los clientes hagan reservas</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Vista de cards para móvil */}
        <div className="md:hidden space-y-4">
          {rentals.map((r) => (
            <div key={r.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-fuchsia-100 text-fuchsia-600 font-semibold text-sm">
                    {r.id.slice(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <h4 className="font-semibold text-slate-900">#{r.id.slice(0, 8)}</h4>
                    <p className="text-sm text-slate-600">Artículo #{r.itemId}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${
                  r.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : r.status === 'canceled'
                    ? 'bg-red-100 text-red-800'
                    : r.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-slate-100 text-slate-800'
                }`}>
                  {r.status === 'active' ? 'Activo' : r.status === 'canceled' ? 'Cancelado' : r.status === 'pending' ? 'Pendiente' : r.status}
                </span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Fechas del alquiler</p>
                  <p className="text-sm text-slate-900 mt-1">
                    {typeof r.start === 'string' ? r.start : r.start.toISOString().slice(0, 10)} 
                    <span className="text-slate-400 mx-2">→</span>
                    {typeof r.end === 'string' ? r.end : r.end.toISOString().slice(0, 10)}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Información del cliente</p>
                  <div className="mt-1">
                    <p className="font-medium text-slate-900">{r.customer.name}</p>
                    <p className="text-sm text-slate-600">{r.customer.email}</p>
                    <p className="text-sm text-slate-600">{r.customer.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Acciones</span>
                  <CancelRentalButton rentalId={r.id} status={r.status} />
                </div>
              </div>
            </div>
          ))}
          
          {rentals.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h8a2 2 0 012 2v4h-2V3H10v4H8zM6 7h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2z" />
              </svg>
              <p className="text-lg font-medium text-slate-500">No hay alquileres programados</p>
              <p className="text-sm text-slate-400 mt-1">Los alquileres aparecerán aquí cuando los clientes hagan reservas</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}