import Link from "next/link";
import HeaderServer from "../components/HeaderServer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900 dark:from-slate-950 dark:to-slate-900 dark:text-slate-100">
      <HeaderServer />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">Política de Privacidad</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Última actualización: 15 de noviembre de 2025
            </p>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">1. Introducción</h2>
              <p className="text-slate-700 dark:text-slate-300">
                En GlamRent, respetamos su privacidad y estamos comprometidos a proteger sus datos personales. Esta Política de Privacidad explica cómo recopilamos, usamos, divulgamos y protegemos su información cuando utiliza nuestros servicios de alquiler de vestidos.
              </p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-2xl font-semibold">2. Información que Recopilamos</h2>
              <p className="text-slate-700 dark:text-slate-300">
                Recopilamos varios tipos de información para proporcionar y mejorar nuestros servicios:
              </p>
              <h3 className="text-xl font-semibold mt-4">Información Personal</h3>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                <li>Nombre, dirección de correo electrónico y número de teléfono</li>
                <li>Direcciones de envío y facturación</li>
                <li>Información de pago (procesada de forma segura a través de proveedores externos)</li>
                <li>Preferencias de talla y ajuste</li>
              </ul>
              <h3 className="text-xl font-semibold mt-4">Información de Cuenta</h3>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                <li>Credenciales de cuenta (nombre de usuario y contraseña cifrada)</li>
                <li>Historial de alquileres y preferencias</li>
                <li>Reseñas y calificaciones que proporciona</li>
              </ul>
              <h3 className="text-xl font-semibold mt-4">Información Recopilada Automáticamente</h3>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                <li>Dirección IP, tipo de navegador e información del dispositivo</li>
                <li>Páginas visitadas y tiempo pasado en nuestro sitio</li>
                <li>Cookies y tecnologías de seguimiento similares</li>
              </ul>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-2xl font-semibold">3. Cómo Usamos su Información</h2>
              <p className="text-slate-700 dark:text-slate-300">
                Usamos su información para los siguientes propósitos:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                <li>Procesar y cumplir con sus pedidos de alquiler</li>
                <li>Comunicarnos con usted sobre sus alquileres, incluidas actualizaciones de envío</li>
                <li>Proporcionar atención al cliente y responder a consultas</li>
                <li>Personalizar su experiencia y recomendar artículos</li>
                <li>Procesar pagos y prevenir fraudes</li>
                <li>Enviar correos electrónicos promocionales y boletines (con su consentimiento)</li>
                <li>Analizar patrones de uso para mejorar nuestros servicios</li>
                <li>Cumplir con obligaciones legales</li>
              </ul>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-2xl font-semibold">4. Compartir y Divulgación de Información</h2>
              <p className="text-slate-700 dark:text-slate-300">
                No vendemos su información personal. Podemos compartir su información con:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                <li><strong>Proveedores de Servicios:</strong> Empresas terceras que nos ayudan a operar nuestro negocio (ej., procesadores de pago, empresas de envío, servicios de limpieza)</li>
                <li><strong>Cumplimiento Legal:</strong> Cuando lo requiera la ley o para proteger nuestros derechos y seguridad</li>
                <li><strong>Transferencias Comerciales:</strong> En conexión con una fusión, adquisición o venta de activos</li>
              </ul>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-2xl font-semibold">5. Seguridad de Datos</h2>
              <p className="text-slate-700 dark:text-slate-300">
                Implementamos medidas de seguridad estándar de la industria para proteger su información personal, incluyendo:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                <li>Encriptación de datos sensibles en tránsito y en reposo</li>
                <li>Tecnología de capa de conexión segura (SSL)</li>
                <li>Auditorías y monitoreo de seguridad regular</li>
                <li>Acceso restringido a información personal según necesidad</li>
              </ul>
              <p className="text-slate-700 dark:text-slate-300 mt-4">
                Sin embargo, ningún método de transmisión por Internet es 100% seguro. Aunque nos esforzamos por proteger sus datos, no podemos garantizar seguridad absoluta.
              </p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-2xl font-semibold">6. Cookies y Tecnologías de Seguimiento</h2>
              <p className="text-slate-700 dark:text-slate-300">
                Usamos cookies y tecnologías similares para mejorar su experiencia de navegación, analizar el tráfico del sitio y personalizar el contenido. Puede controlar las preferencias de cookies a través de la configuración de su navegador, pero deshabilitar las cookies puede limitar algunas funcionalidades.
              </p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-2xl font-semibold">7. Sus Derechos y Opciones</h2>
              <p className="text-slate-700 dark:text-slate-300">
                Tiene los siguientes derechos con respecto a su información personal:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
                <li><strong>Acceso:</strong> Solicitar una copia de los datos personales que tenemos sobre usted</li>
                <li><strong>Corrección:</strong> Solicitar la corrección de datos inexactos o incompletos</li>
                <li><strong>Eliminación:</strong> Solicitar la eliminación de sus datos personales (sujeto a obligaciones legales)</li>
                <li><strong>Exclusión:</strong> Cancelar la suscripción a comunicaciones de marketing en cualquier momento</li>
                <li><strong>Portabilidad de Datos:</strong> Solicitar una copia de sus datos en un formato legible por máquina</li>
              </ul>
              <p className="text-slate-700 dark:text-slate-300 mt-4">
                Para ejercer estos derechos, por favor contáctenos a través de nuestra{" "}
                <Link href="/contact" className="text-fuchsia-600 hover:underline">
                  página de contacto
                </Link>.
              </p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-2xl font-semibold">8. Retención de Datos</h2>
              <p className="text-slate-700 dark:text-slate-300">
                Retenemos su información personal durante el tiempo necesario para cumplir con los propósitos descritos en esta política, a menos que la ley requiera un período de retención más largo. El historial de alquileres puede retenerse para fines contables y legales.
              </p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-2xl font-semibold">9. Privacidad de Menores</h2>
              <p className="text-slate-700 dark:text-slate-300">
                Nuestros servicios no están dirigidos a personas menores de 18 años. No recopilamos intencionalmente información personal de niños. Si nos enteramos de que hemos recopilado datos de un niño, tomaremos medidas para eliminarlos.
              </p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-2xl font-semibold">10. Enlaces de Terceros</h2>
              <p className="text-slate-700 dark:text-slate-300">
                Nuestro sitio web puede contener enlaces a sitios web de terceros. No somos responsables de las prácticas de privacidad de estos sitios externos. Le recomendamos que revise sus políticas de privacidad.
              </p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-2xl font-semibold">11. Cambios a Esta Política de Privacidad</h2>
              <p className="text-slate-700 dark:text-slate-300">
                Podemos actualizar esta Política de Privacidad de vez en cuando. Le notificaremos de cambios significativos publicando la nueva política en esta página y actualizando la fecha de "Última actualización". Su uso continuado de nuestros servicios constituye la aceptación de la política actualizada.
              </p>
            </section>

            <section className="space-y-4 mt-8">
              <h2 className="text-2xl font-semibold">12. Contáctenos</h2>
              <p className="text-slate-700 dark:text-slate-300">
                Si tiene alguna pregunta o inquietud sobre esta Política de Privacidad o nuestras prácticas de datos, por favor contáctenos a través de nuestra{" "}
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
