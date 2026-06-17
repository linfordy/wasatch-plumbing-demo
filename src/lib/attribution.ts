export interface TouchData {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  referrer: string;
  landing_page: string;
  timestamp: string;
}

export interface AttributionData {
  first_touch: TouchData;
  last_touch: TouchData;
  session_id: string;
}

const COOKIE_NAME = "_lp_attr";
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

function generateSessionId(): string {
  return crypto.randomUUID();
}

function getUrlParams(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const result: Record<string, string> = {};
  for (const [key, value] of params.entries()) {
    result[key] = value;
  }
  return result;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, maxAge: number): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=${maxAge};SameSite=Lax`;
}

export function captureAttribution(): void {
  const params = getUrlParams();
  const hasUtms = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].some(
    (key) => params[key]
  );

  const currentTouch: TouchData = {
    utm_source: params.utm_source || "",
    utm_medium: params.utm_medium || "",
    utm_campaign: params.utm_campaign || "",
    utm_content: params.utm_content || "",
    utm_term: params.utm_term || "",
    referrer: typeof document !== "undefined" ? document.referrer : "",
    landing_page: typeof window !== "undefined" ? window.location.pathname : "",
    timestamp: new Date().toISOString(),
  };

  const existingRaw = getCookie(COOKIE_NAME);
  let attribution: AttributionData;

  if (existingRaw) {
    try {
      attribution = JSON.parse(existingRaw);
      // Update last_touch
      if (hasUtms) {
        attribution.last_touch = currentTouch;
      } else {
        attribution.last_touch = {
          ...attribution.last_touch,
          referrer: currentTouch.referrer,
          landing_page: currentTouch.landing_page,
          timestamp: currentTouch.timestamp,
        };
      }
    } catch {
      attribution = {
        first_touch: currentTouch,
        last_touch: currentTouch,
        session_id: generateSessionId(),
      };
    }
  } else {
    attribution = {
      first_touch: currentTouch,
      last_touch: currentTouch,
      session_id: generateSessionId(),
    };
  }

  setCookie(COOKIE_NAME, JSON.stringify(attribution), COOKIE_MAX_AGE);
}

export function getAttribution(): AttributionData | null {
  const raw = getCookie(COOKIE_NAME);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
