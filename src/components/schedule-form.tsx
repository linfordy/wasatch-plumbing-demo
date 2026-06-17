"use client";

import { useState, useRef } from "react";
import { submitForm } from "@/app/actions/submit-form";
import { getAttribution } from "@/lib/attribution";
import { company } from "@/data/company";

const serviceOptions = [
  "Emergency Plumbing",
  "Residential Plumbing",
  "Commercial Plumbing",
  "Water Heater Repair/Install",
  "Tankless Water Heater",
  "Drain Cleaning",
  "Backflow Testing",
  "Other",
];

export function ScheduleForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const formRef = useRef<HTMLFormElement>(null);
  const timestampRef = useRef(Date.now());

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");

    const formData = new FormData(e.currentTarget);
    const attribution = getAttribution();

    const result = await submitForm({
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      state: "TX",
      zip: formData.get("zip") as string,
      service: formData.get("service") as string,
      message: formData.get("message") as string,
      formType: "schedule-service",
      page: window.location.pathname,
      attribution: attribution as Record<string, unknown> | null,
      honeypot: formData.get("website") as string,
      timestamp: timestampRef.current,
    });

    if (result.success) {
      // GA4 conversion event
      if (typeof window !== "undefined" && typeof window.gtag === "function") {
        window.gtag("event", "generate_lead", {
          event_category: "form",
          event_label: formData.get("service") as string || "General",
          value: 1,
        });
      }
      setStatus("success");
      formRef.current?.reset();
    } else {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-brand-dark border border-brand-darker rounded-xl p-8 text-center">
        <div className="text-3xl mb-3">✓</div>
        <h3 className="text-xl font-bold mb-2">Request Received!</h3>
        <p className="text-gray-400 text-sm mb-4">
          We&apos;ll get back to you shortly. For immediate service, call us:
        </p>
        <a
          href={`tel:${company.phoneRaw}`}
          className="text-brand-red font-bold text-lg"
        >
          {company.phone}
        </a>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="bg-brand-dark border border-brand-darker rounded-xl p-6 lg:p-8 space-y-4"
    >
      <h3 className="text-xl font-bold mb-2">Schedule Service</h3>
      <p className="text-gray-500 text-sm mb-4">
        Prefer to call?{" "}
        <a href={`tel:${company.phoneRaw}`} className="text-brand-red font-semibold">
          {company.phone}
        </a>
      </p>

      {/* Honeypot */}
      <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          name="firstName"
          placeholder="First Name *"
          required
          className="bg-brand-black border border-brand-darker rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-brand-red focus:outline-none transition-colors"
        />
        <input
          name="lastName"
          placeholder="Last Name *"
          required
          className="bg-brand-black border border-brand-darker rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-brand-red focus:outline-none transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          name="phone"
          type="tel"
          placeholder="Phone *"
          required
          className="bg-brand-black border border-brand-darker rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-brand-red focus:outline-none transition-colors"
        />
        <input
          name="email"
          type="email"
          placeholder="Email *"
          required
          className="bg-brand-black border border-brand-darker rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-brand-red focus:outline-none transition-colors"
        />
      </div>

      <input
        name="address"
        placeholder="Street Address"
        className="w-full bg-brand-black border border-brand-darker rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-brand-red focus:outline-none transition-colors"
      />

      <div className="grid grid-cols-2 gap-4">
        <input
          name="city"
          placeholder="City"
          className="bg-brand-black border border-brand-darker rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-brand-red focus:outline-none transition-colors"
        />
        <input
          name="zip"
          placeholder="ZIP Code"
          className="bg-brand-black border border-brand-darker rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-brand-red focus:outline-none transition-colors"
        />
      </div>

      <select
        name="service"
        className="w-full bg-brand-black border border-brand-darker rounded-lg px-4 py-3 text-sm text-gray-400 focus:border-brand-red focus:outline-none transition-colors"
      >
        <option value="">Select a Service</option>
        {serviceOptions.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <textarea
        name="message"
        placeholder="Describe your plumbing issue..."
        rows={3}
        className="w-full bg-brand-black border border-brand-darker rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-brand-red focus:outline-none transition-colors resize-none"
      />

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full bg-brand-red text-white py-3.5 rounded-lg font-bold text-sm hover:shadow-[0_8px_30px_rgba(196,30,30,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === "submitting" ? "Sending..." : "Request Service"}
      </button>

      {status === "error" && (
        <p className="text-red-400 text-sm text-center">
          Something went wrong. Please call us at {company.phone}.
        </p>
      )}
    </form>
  );
}
