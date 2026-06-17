declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
  }
}

export function trackEvent(action: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", action, params);
  }
}

export function trackPhoneClick() {
  trackEvent("phone_click", {
    event_category: "contact",
    event_label: "phone_call",
    value: 1,
  });
}

export function trackTextClick() {
  trackEvent("text_click", {
    event_category: "contact",
    event_label: "sms",
    value: 1,
  });
}
