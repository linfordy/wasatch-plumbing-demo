"use client";

import { useState } from "react";

interface FAQ {
  question: string;
  answer: string;
}

export function FAQAccordion({ faqs }: { faqs: FAQ[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <div
          key={i}
          className="bg-brand-dark border border-brand-darker rounded-xl overflow-hidden"
        >
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full text-left px-6 py-4 flex items-center justify-between gap-4"
          >
            <span className="font-semibold text-sm">{faq.question}</span>
            <span
              className={`text-brand-red text-lg transition-transform ${openIndex === i ? "rotate-45" : ""}`}
            >
              +
            </span>
          </button>
          {openIndex === i && (
            <div className="px-6 pb-4">
              <p className="text-gray-400 text-sm leading-relaxed">
                {faq.answer}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
