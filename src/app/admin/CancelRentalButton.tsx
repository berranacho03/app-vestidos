'use client'

import { useState } from 'react'

interface CancelRentalButtonProps {
  rentalId: string
  status: string
}

export default function CancelRentalButton({ rentalId, status }: CancelRentalButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    
    setIsSubmitting(true)
    
    try {
      const response = await fetch(`/api/admin/rentals/${rentalId}`, {
        method: 'POST',
      })
      
      if (response.ok) {
        // Recargar la página para mostrar los cambios
        window.location.reload()
      } else {
        console.error('Error canceling rental')
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error('Error:', error)
      setIsSubmitting(false)
    }
  }

  if (status !== "active") {
    return <span className="text-slate-400">—</span>
  }

  return (
    <form onSubmit={handleSubmit}>
      <button 
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center gap-1 rounded-lg border border-red-300 text-red-600 px-3 py-1 text-sm hover:bg-red-50 hover:border-red-400 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Cancelando...
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancelar
          </>
        )}
      </button>
    </form>
  )
}