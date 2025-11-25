import Link from "next/link";
import HeaderServer from "../components/HeaderServer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900 dark:from-slate-950 dark:to-slate-900 dark:text-slate-100">
      <HeaderServer />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">Términos de Servicio</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Última actualización: 15 de noviembre de 2025
            </p>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">1. Aceptación de los Términos</h2>
              <p className="text-slate-700 dark:text-slate-300">
                Al acceder y utilizar los servicios de alquiler de vestidos de GlamRent, usted acepta y se compromete a cumplir con estos Términos de Servicio. Si no está de acuerdo con estos términos, por favor no utilice nuestros servicios.
              </p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-2xl font-semibold">2. Acuerdo de Alquiler</h2>
              <p className="text-slate-700 dark:text-slate-300">
                Cuando alquila un vestido de GlamRent, usted se compromete a:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                <li>Devolver el artículo a tiempo y en las mismas condiciones en que lo recibió</li>
                <li>Pagar la tarifa de alquiler por el período acordado</li>
                <li>No subarrendar, vender o transferir el artículo alquilado a terceros</li>
                <li>Notificarnos inmediatamente de cualquier daño o defecto</li>
                <li>Proporcionar información precisa sobre tallas y entrega</li>
              </ul>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-2xl font-semibold">3. Período de Alquiler y Devoluciones</h2>
              <p className="text-slate-700 dark:text-slate-300">
                Los períodos de alquiler van hasta 5 días. El período de alquiler comienza en la fecha de entrega y finaliza en la fecha de devolución especificada en su pedido. Las devoluciones tardías pueden incurrir en cargos adicionales. Los artículos deben devolverse utilizando la etiqueta de envío prepagada proporcionada.
              </p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-2xl font-semibold">4. Daños y Pérdidas</h2>
              <p className="text-slate-700 dark:text-slate-300">
                El desgaste normal es esperado y está cubierto por nuestro servicio de limpieza gratuito. Sin embargo, los clientes son responsables de:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                <li>Daños excesivos más allá del desgaste normal</li>
                <li>Manchas que no pueden eliminarse mediante limpieza profesional</li>
                <li>Pérdida o robo del artículo alquilado</li>
                <li>Alteraciones o modificaciones al vestido</li>
              </ul>
              <p className="text-slate-700 dark:text-slate-300 mt-4">
                Las tarifas por daños se evaluarán según la extensión del daño y el costo de reparación o reemplazo.
              </p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-2xl font-semibold">5. Pago y Cancelaciones</h2>
              <p className="text-slate-700 dark:text-slate-300">
                Todos los alquileres deben pagarse en su totalidad al momento de la reserva. Las cancelaciones realizadas con más de 7 días antes de la fecha de inicio del alquiler reciben un reembolso completo. Las cancelaciones realizadas dentro de los 7 días están sujetas a una tarifa de cancelación del 50%.
              </p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-2xl font-semibold">6. Disponibilidad</h2>
              <p className="text-slate-700 dark:text-slate-300">
                Aunque nos esforzamos por garantizar que todos los artículos mostrados como disponibles puedan alquilarse, circunstancias fuera de nuestro control pueden ocasionalmente requerir que sustituyamos o cancelemos un pedido. En tales casos, recibirá un reembolso completo o la opción de seleccionar un artículo alternativo.
              </p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-2xl font-semibold">7. Cuentas de Usuario</h2>
              <p className="text-slate-700 dark:text-slate-300">
                Usted es responsable de mantener la confidencialidad de sus credenciales de cuenta y de todas las actividades que ocurran bajo su cuenta. Notifíquenos inmediatamente de cualquier uso no autorizado de su cuenta.
              </p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-2xl font-semibold">8. Usos Prohibidos</h2>
              <p className="text-slate-700 dark:text-slate-300">
                No puede usar nuestros servicios para ningún propósito ilegal o no autorizado. No debe violar ninguna ley en su jurisdicción mientras usa nuestro servicio.
              </p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-2xl font-semibold">9. Limitación de Responsabilidad</h2>
              <p className="text-slate-700 dark:text-slate-300">
                GlamRent no será responsable de ningún daño indirecto, incidental, especial, consecuente o punitivo que resulte de su uso o incapacidad para usar nuestros servicios.
              </p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-2xl font-semibold">10. Cambios en los Términos</h2>
              <p className="text-slate-700 dark:text-slate-300">
                Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigencia inmediatamente después de su publicación. Su uso continuado del servicio constituye la aceptación de los términos modificados.
              </p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-2xl font-semibold">11. Información de Contacto</h2>
              <p className="text-slate-700 dark:text-slate-300">
                Si tiene alguna pregunta sobre estos Términos de Servicio, por favor contáctenos a través de nuestra{" "}
                <Link href="/contact" className="text-fuchsia-600 hover:underline">
                  página de contacto
                </Link>.
              </p>
            </section>
          </div>

          <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
            <Link
              href="/"
              className="inline-flex items-center text-fuchsia-600 hover:underline"
            >
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 mt-16">
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
