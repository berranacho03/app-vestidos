"use client";

import { useEffect, useState } from "react";

type Props = { itemId: number };

type Range = { start: string; end: string };

function toISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function ItemCalendar({ itemId }: Props) {
  const [busy, setBusy] = useState<Range[]>([]);
  const [selectedStart, setSelectedStart] = useState<string | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/items/${itemId}/availability`)
      .then((r) => r.json())
      .then((data) => setBusy(data.rentals ?? []))
      .catch(() => setBusy([]));
  }, [itemId]);

  // Sincronizar las fechas seleccionadas con los inputs del formulario
  useEffect(() => {
    const startInput = document.querySelector('input[name="start"]') as HTMLInputElement;
    const endInput = document.querySelector('input[name="end"]') as HTMLInputElement;
    
    if (startInput && selectedStart) {
      startInput.value = selectedStart;
    }
    if (endInput && selectedEnd) {
      endInput.value = selectedEnd;
    }
  }, [selectedStart, selectedEnd]);

  // Mostrar los próximos 60 días
  const today = new Date();
  const days = Array.from({ length: 60 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d;
  });

  function isBooked(date: Date) {
    const iso = toISO(date);
    return busy.some((r) => r.start <= iso && iso <= r.end);
  }

  function isInSelectedRange(date: Date) {
    if (!selectedStart || !selectedEnd) return false;
    const iso = toISO(date);
    return iso >= selectedStart && iso <= selectedEnd;
  }

  function isSelectedDate(date: Date) {
    const iso = toISO(date);
    return iso === selectedStart || iso === selectedEnd;
  }

  function handleDateClick(date: Date) {
    const iso = toISO(date);
    
    // No permitir seleccionar fechas reservadas
    if (isBooked(date)) return;
    
    // Si no hay fecha de inicio, establecerla
    if (!selectedStart) {
      setSelectedStart(iso);
      setSelectedEnd(null);
      return;
    }
    
    // Si hay fecha de inicio pero no de fin
    if (selectedStart && !selectedEnd) {
      if (iso < selectedStart) {
        // Si la nueva fecha es anterior, la ponemos como inicio
        setSelectedStart(iso);
        setSelectedEnd(null);
      } else {
        // Verificar que no hay fechas reservadas en el rango
        const start = new Date(selectedStart);
        const end = new Date(iso);
        let hasBookedInRange = false;
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          if (isBooked(d)) {
            hasBookedInRange = true;
            break;
          }
        }
        
        if (!hasBookedInRange) {
          setSelectedEnd(iso);
        } else {
          // Si hay fechas reservadas en el rango, empezar de nuevo
          setSelectedStart(iso);
          setSelectedEnd(null);
        }
      }
      return;
    }
    
    // Si ambas fechas están seleccionadas, empezar de nuevo
    setSelectedStart(iso);
    setSelectedEnd(null);
  }

  return (
    <div>
      <div className="grid grid-cols-7 gap-2 mb-4">
        {days.map((d) => {
          const booked = isBooked(d);
          const inRange = isInSelectedRange(d);
          const isSelected = isSelectedDate(d);
          const isPast = d < today;
          
          return (
            <div
              key={d.toISOString()}
              title={toISO(d)}
              onClick={() => !booked && !isPast && handleDateClick(d)}
              className={`text-center text-xs rounded-md px-2 py-3 cursor-pointer transition-colors ${
                booked 
                  ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200 cursor-not-allowed opacity-60" 
                  : isPast
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : isSelected
                  ? "bg-fuchsia-600 text-white"
                  : inRange
                  ? "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/40 dark:text-fuchsia-200"
                  : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              {booked && <div className="mt-1 text-xs">Reservado</div>}
            </div>
          );
        })}
      </div>
      
      {selectedStart && (
        <div className="text-sm text-slate-600 dark:text-slate-400">
          <p>
            <span className="font-medium">Selected:</span> {selectedStart}
            {selectedEnd && ` to ${selectedEnd}`}
          </p>
          <p className="text-xs mt-1">
            {selectedEnd 
              ? "Click on a date to start a new selection" 
              : "Click on another available date to complete your selection"
            }
          </p>
        </div>
      )}
    </div>
  );
}
