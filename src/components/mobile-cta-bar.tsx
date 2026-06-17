"use client";

import { company } from "@/data/company";
import { trackPhoneClick, trackTextClick } from "@/lib/gtag";

export function MobileCTABar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-brand-dark/95 backdrop-blur-lg border-t border-brand-darker">
      <div className="flex">
        <a
          href={`tel:${company.phoneRaw}`}
          onClick={trackPhoneClick}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 text-white font-semibold text-sm bg-brand-red"
        >
          <span>📞</span> Call
        </a>
        <a
          href={`sms:${company.textRaw}`}
          onClick={trackTextClick}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 text-white font-semibold text-sm border-l border-brand-darker"
        >
          <span>💬</span> Text
        </a>
        <a
          href="/contact"
          className="flex-1 flex items-center justify-center gap-2 py-3.5 text-white font-semibold text-sm border-l border-brand-darker"
        >
          <span>📅</span> Book
        </a>
      </div>
    </div>
  );
}
