'use client'

import { useState, useRef, useEffect } from 'react'
import Swal from 'sweetalert2'

interface CancelRentalButtonProps {
  rentalId: string
  status: string
}

export default function CancelRentalButton({ rentalId, status }: CancelRentalButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])

  const handleCancel = async () => {
    if (isSubmitting) return
    
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Confirma que desea cancelar este alquiler?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No',
    })

    if (!result.isConfirmed) return

    setIsSubmitting(true)
    setMenuOpen(false)
    
    try {
      const response = await fetch(`/api/admin/rentals/${rentalId}`, { method: 'POST' })
      if (response.ok) {
        await Swal.fire({
          icon: 'success',
          title: 'Cancelado',
          text: 'El alquiler se canceló correctamente',
          timer: 2000,
          showConfirmButton: false,
        })
        window.location.reload()
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Error al cancelar el alquiler')
      }
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err?.message || 'Ocurrió un error al cancelar el alquiler',
      })
      setIsSubmitting(false)
    }
  }

  const handleApprove = async () => {
    if (isSubmitting) return
    
    const result = await Swal.fire({
      title: '¿Aprobar este alquiler?',
      text: 'El alquiler pasará a estado activo',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, aprobar',
      cancelButtonText: 'Cancelar',
    })

    if (!result.isConfirmed) return

    setIsSubmitting(true)
    setMenuOpen(false)
    
    try {
      const response = await fetch(`/api/admin/rentals/${rentalId}/approve`, { method: 'POST' })
      if (response.ok) {
        await Swal.fire({
          icon: 'success',
          title: 'Aprobado',
          text: 'El alquiler fue aprobado correctamente',
          timer: 2000,
          showConfirmButton: false,
        })
        window.location.reload()
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Error al aprobar el alquiler')
      }
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err?.message || 'Ocurrió un error al aprobar el alquiler',
      })
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (isSubmitting) return
    
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Eliminará permanentemente este alquiler. No podrás revertir esta acción.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    })

    if (!result.isConfirmed) return

    setIsSubmitting(true)
    setMenuOpen(false)
    
    try {
      const response = await fetch(`/api/admin/rentals/${rentalId}`, { method: 'DELETE' })
      if (response.ok) {
        await Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'El alquiler se eliminó correctamente',
          timer: 2000,
          showConfirmButton: false,
        })
        window.location.reload()
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Error al eliminar el alquiler')
      }
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err?.message || 'Ocurrió un error al eliminar el alquiler',
      })
      setIsSubmitting(false)
    }
  }

  if (status !== "active" && status !== "canceled" && status !== "pending") {
    return <span className="text-slate-400">—</span>
  }

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={(e) => { e.stopPropagation(); setMenuOpen((s) => !s) }}
        aria-expanded={menuOpen}
        aria-haspopup="true"
        className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-slate-600 hover:bg-slate-100 transition-all"
        title="Opciones"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>

      {menuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
          {status === 'pending' && (
            <button 
              onClick={(e) => { e.stopPropagation(); handleApprove() }} 
              className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Aprobar
            </button>
          )}
          {(status === 'active' || status === 'pending') && (
            <button 
              onClick={(e) => { e.stopPropagation(); handleCancel() }} 
              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
              </svg>
              Cancelar
            </button>
          )}
          <button 
            onClick={(e) => { e.stopPropagation(); handleDelete() }} 
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Eliminar
          </button>
        </div>
      )}

      {isSubmitting && (
        <span className="sr-only">Procesando...</span>
      )}
    </div>
  )
}