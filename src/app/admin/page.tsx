import { isAdmin, getOrCreateCsrfToken } from "@/lib/CsrfSessionManagement";
import { listRentals } from "@/lib/RentalManagementSystem";
import { redirect } from "next/navigation";
import InventoryManager from "./InventoryManager";

type AdminItem = {
  id: number | string;
  name: string;
  category: string;
  sizes: string[];
  pricePerDay: number;
};

export default async function Page() {
  if (!isAdmin()) redirect("/admin/login");
  const csrf = await getOrCreateCsrfToken();

  const rentals = listRentals();

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
        {/* hot-reload test */}
        <h2 className="font-semibold">Inventario</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">Agrega o edita items desde aquí.</p>
        <div className="mt-4">
          <InventoryManager />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-semibold">Scheduled rentals</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="py-2 pr-4">Rental ID</th>
                <th className="py-2 pr-4">Item</th>
                <th className="py-2 pr-4">Dates</th>
                <th className="py-2 pr-4">Customer</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rentals.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="py-2 pr-4">{r.id.slice(0, 8)}</td>
                  <td className="py-2 pr-4">{r.itemId}</td>
                  <td className="py-2 pr-4">
                    {r.start} → {r.end}
                  </td>
                  <td className="py-2 pr-4">
                    {r.customer.name}
                    <div className="text-slate-500 text-xs">{r.customer.email} • {r.customer.phone}</div>
                  </td>
                  <td className="py-2 pr-4 capitalize">{r.status}</td>
                  <td className="py-2 pr-4">
                    {r.status === "active" ? (
                      <form
                        onSubmit={async () => {
                          // no-op on server; keep for semantics
                        }}
                        action={`/api/admin/rentals/${r.id}/cancel`}
                        method="POST"
                      >
                        <input type="hidden" name="csrf" value={csrf} />
                        <button className="rounded-lg border px-3 py-1 hover:bg-slate-50 dark:hover:bg-slate-800">Cancel</button>
                      </form>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {rentals.length === 0 && (
                <tr>
                  <td className="py-3 text-slate-500" colSpan={6}>Aún no hay alquileres.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
