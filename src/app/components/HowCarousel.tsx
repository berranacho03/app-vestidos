"use client";
import React, { useEffect, useState } from "react";

type Step = {
  emoji: string;
  title: string;
  text: string;
};

export default function HowCarousel({ steps }: { steps: Step[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // optional: autoplay could be added, but keep manual controls for now
  }, []);

  function prev() {
    setIndex((i) => (i - 1 + steps.length) % steps.length);
  }

  function next() {
    setIndex((i) => (i + 1) % steps.length);
  }

  return (
    <div className="sm:hidden">
      <div className="relative">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-fuchsia-600/10 flex items-center justify-center text-2xl">{steps[index].emoji}</div>
          <h3 className="mt-4 font-semibold">{steps[index].title}</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{steps[index].text}</p>
        </div>

        <button
          onClick={prev}
          aria-label="Anterior"
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-slate-800/80 backdrop-blur rounded-full p-2 shadow-sm border border-slate-200 dark:border-slate-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-700" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.293 15.293a1 1 0 010-1.414L15.586 10 12.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" transform="rotate(180 14 10)" />
          </svg>
        </button>

        <button
          onClick={next}
          aria-label="Siguiente"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-slate-800/80 backdrop-blur rounded-full p-2 shadow-sm border border-slate-200 dark:border-slate-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-700" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.707 4.707a1 1 0 010 1.414L4.414 10l3.293 3.879a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" transform="rotate(180 6 10)" />
          </svg>
        </button>

        <div className="flex items-center justify-center gap-2 mt-3">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Ir al paso ${i + 1}`}
              className={`h-2 w-8 rounded-full ${i === index ? 'bg-fuchsia-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
