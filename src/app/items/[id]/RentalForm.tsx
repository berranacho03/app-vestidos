'use client'

import { useState, FormEvent } from 'react'
import Swal from 'sweetalert2'
import { useRouter } from 'next/navigation'

interface RentalFormProps {
  itemId: number
  csrf: string
  isAuthenticated: boolean
  fullUserInfo: {
    name: string
    email: string
    phone: string
  } | null
}

export default function RentalForm({ itemId, csrf, isAuthenticated, fullUserInfo }: RentalFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (isSubmitting) return
    
    const formData = new FormData(e.currentTarget)
    const name = formData.get('name')?.toString().trim() || ''
    const email = formData.get('email')?.toString().trim() || ''
    const phone = formData.get('phone')?.toString().trim() || ''
    const start = formData.get('start')?.toString().trim() || ''
    const end = formData.get('end')?.toString().trim() || ''

    // Validaciones del lado del cliente
    if (!isAuthenticated) {
      if (!name || name.length < 3) {
        Swal.fire({
          icon: 'warning',
          title: 'Nombre incompleto',
          text: 'Por favor, ingresa tu nombre completo (mínimo 3 caracteres)',
        })
        return
      }

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        Swal.fire({
          icon: 'warning',
          title: 'Email inválido',
          text: 'Por favor, ingresa un correo electrónico válido',
        })
        return
      }

      if (!phone || phone.length < 8) {
        Swal.fire({
          icon: 'warning',
          title: 'Teléfono incompleto',
          text: 'Por favor, ingresa un número de teléfono válido (mínimo 8 dígitos)',
        })
        return
      }
    }

    if (!start) {
      Swal.fire({
        icon: 'warning',
        title: 'Fecha de inicio requerida',
        text: 'Por favor, selecciona una fecha de inicio',
      })
      return
    }

    if (!end) {
      Swal.fire({
        icon: 'warning',
        title: 'Fecha de fin requerida',
        text: 'Por favor, selecciona una fecha de fin',
      })
      return
    }

    if (end < start) {
      Swal.fire({
        icon: 'warning',
        title: 'Fechas inválidas',
        text: 'La fecha de fin debe ser posterior a la fecha de inicio',
      })
      return
    }

    // Validar que el periodo no exceda 5 días
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays > 5) {
      Swal.fire({
        icon: 'warning',
        title: 'Periodo muy largo',
        text: 'El periodo de alquiler no puede ser mayor a 5 días',
      })
      return
    }

    // Validar que las fechas no sean en el pasado
    const today = new Date().toISOString().split('T')[0]
    if (start < today) {
      Swal.fire({
        icon: 'warning',
        title: 'Fecha inválida',
        text: 'La fecha de inicio no puede ser en el pasado',
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/rentals', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json().catch(() => ({}))

      if (response.ok) {
        await Swal.fire({
          icon: 'success',
          title: '¡Reserva enviada!',
          text: 'Tu solicitud de alquiler ha sido enviada y está pendiente de aprobación. Te contactaremos pronto.',
          confirmButtonText: 'Entendido',
        })
        // Recargar la página para mostrar las fechas bloqueadas
        window.location.reload()
      } else {
        // Manejar errores específicos del servidor
        let errorMessage = 'Ocurrió un error al procesar tu solicitud'
        let errorTitle = 'Error en la reserva'

        if (data.error) {
          if (data.error.includes('CSRF')) {
            errorTitle = 'Sesión expirada'
            errorMessage = 'Por favor, recarga la página e intenta nuevamente'
          } else if (data.error.includes('not available')) {
            errorTitle = 'No disponible'
            errorMessage = 'El artículo no está disponible para las fechas seleccionadas. Por favor, elige otras fechas.'
          } else if (data.error.includes('End date')) {
            errorTitle = 'Fechas inválidas'
            errorMessage = 'La fecha de fin debe ser posterior a la fecha de inicio'
          } else if (data.error.includes('exceed 5 days')) {
            errorTitle = 'Periodo muy largo'
            errorMessage = 'El periodo de alquiler no puede ser mayor a 5 días'
          } else if (data.error.includes('not found')) {
            errorTitle = 'Artículo no encontrado'
            errorMessage = 'El artículo que intentas alquilar no existe'
          } else if (data.error.includes('Missing')) {
            errorTitle = 'Campos incompletos'
            errorMessage = 'Por favor, completa todos los campos requeridos'
          } else {
            errorMessage = data.error
          }
        }

        await Swal.fire({
          icon: 'error',
          title: errorTitle,
          text: errorMessage,
        })
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error('Error submitting rental:', error)
      await Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No se pudo conectar con el servidor. Por favor, verifica tu conexión e intenta nuevamente.',
      })
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-2xl border p-4">
      <input type="hidden" name="itemId" value={itemId} />
      <input type="hidden" name="csrf" value={csrf} />
      
      {isAuthenticated && fullUserInfo ? (
        // Usuario autenticado: usar datos ocultos
        <>
          <input type="hidden" name="name" value={fullUserInfo.name} />
          <input type="hidden" name="email" value={fullUserInfo.email} />
          <input type="hidden" name="phone" value={fullUserInfo.phone} />
          
          {/* Mostrar información del usuario */}
          <div className="sm:col-span-2 bg-slate-50 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-medium text-slate-700 mb-2">Alquilando como usuario:</h3>
            <p className="text-sm text-slate-600">{fullUserInfo.name} • {fullUserInfo.email} • {fullUserInfo.phone}</p>
          </div>
        </>
      ) : (
        // Usuario no autenticado: mostrar campos de información personal
        <>
          <div className="sm:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
              Nombre completo <span className="text-red-500">*</span>
            </label>
            <input 
              id="name" 
              name="name" 
              type="text"
              required 
              minLength={3}
              placeholder="Ingresa tu nombre completo" 
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200 outline-none transition-all"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
              Correo electrónico <span className="text-red-500">*</span>
            </label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              required 
              placeholder="tu@email.com" 
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200 outline-none transition-all"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
              Teléfono <span className="text-red-500">*</span>
            </label>
            <input 
              id="phone" 
              name="phone" 
              type="tel"
              required 
              minLength={8}
              placeholder="Tu número de teléfono" 
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200 outline-none transition-all"
              disabled={isSubmitting}
            />
          </div>
        </>
      )}
      
      {/* Campos de fechas - siempre visibles */}
      <div>
        <label htmlFor="start" className="block text-sm font-medium text-slate-700 mb-2">
          Fecha de inicio <span className="text-red-500">*</span>
        </label>
        <input 
          id="start" 
          name="start" 
          type="date" 
          required 
          min={new Date().toISOString().split('T')[0]}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200 outline-none transition-all"
          disabled={isSubmitting}
        />
      </div>
      <div>
        <label htmlFor="end" className="block text-sm font-medium text-slate-700 mb-2">
          Fecha de fin <span className="text-red-500">*</span>
        </label>
        <input 
          id="end" 
          name="end" 
          type="date" 
          required 
          min={new Date().toISOString().split('T')[0]}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200 outline-none transition-all"
          disabled={isSubmitting}
        />
      </div>
      
      <div className="sm:col-span-2">
        <button 
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto rounded-xl bg-fuchsia-600 text-white px-6 py-3 text-sm font-semibold hover:bg-fuchsia-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2 justify-center">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Procesando...
            </span>
          ) : (
            isAuthenticated ? "Alquilar ahora" : "Solicitar alquiler"
          )}
        </button>
      </div>
    </form>
  )
}
