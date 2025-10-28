'use client';

import React, { useState } from 'react';

type FAQItem = {
  question: string;
  answer: string | React.ReactNode;
};

interface FAQListProps {
  faqs: FAQItem[];
}

export function FAQList({ faqs }: FAQListProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mt-8 space-y-4">
      {faqs.map((faq, index) => (
        <div
          key={index}
          className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden"
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full px-4 py-3 text-left flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/60"
          >
            <span className="font-medium">{faq.question}</span>
            <span className="ml-4 flex-shrink-0">
              {openIndex === index ? (
                <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </span>
          </button>
          {openIndex === index && (
            <div className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60">
              {faq.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}