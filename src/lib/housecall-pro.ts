const API_BASE = "https://api.housecallpro.com";
const API_KEY = process.env.HOUSECALL_PRO_API_KEY;

interface CreateLeadInput {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  service?: string;
  message?: string;
  leadSource: string;
  attribution?: Record<string, unknown> | null;
}

interface HCPResult {
  success: boolean;
  leadId?: string;
  error?: string;
}

function formatAttribution(attribution: Record<string, unknown> | null): string {
  if (!attribution) return "No attribution data";
  const ft = attribution.first_touch as Record<string, string> | undefined;
  const lt = attribution.last_touch as Record<string, string> | undefined;

  let text = "--- Attribution ---\n";
  if (ft) {
    text += `First Touch: ${ft.utm_source || "direct"} / ${ft.utm_medium || "none"}\n`;
    text += `Campaign: ${ft.utm_campaign || "none"}\n`;
    text += `Landing: ${ft.landing_page || "/"}\n`;
    text += `Referrer: ${ft.referrer || "direct"}\n`;
    text += `Time: ${ft.timestamp || "unknown"}\n`;
  }
  if (lt && lt.timestamp !== ft?.timestamp) {
    text += `\nLast Touch: ${lt.utm_source || "direct"} / ${lt.utm_medium || "none"}\n`;
    text += `Campaign: ${lt.utm_campaign || "none"}\n`;
    text += `Landing: ${lt.landing_page || "/"}\n`;
  }
  return text;
}

export async function createHousecallProLead(input: CreateLeadInput): Promise<HCPResult> {
  if (!API_KEY) {
    console.error("HOUSECALL_PRO_API_KEY is not set");
    return { success: false, error: "API key not configured" };
  }

  try {
    // Step 1: Create or find customer
    // Note: lead_source must be a pre-configured value in HouseCall Pro.
    // We put source info in notes instead to avoid "Lead source not found" errors.
    const customerPayload = {
      first_name: input.firstName,
      last_name: input.lastName,
      email: input.email,
      mobile_number: input.phone,
      notifications_enabled: true,
      notes: [
        `Lead Source: ${input.leadSource}`,
        input.message ? `Message: ${input.message}` : "",
        input.service ? `Service Requested: ${input.service}` : "",
        formatAttribution(input.attribution ?? null),
      ]
        .filter(Boolean)
        .join("\n\n"),
      addresses: input.address
        ? [
            {
              street: input.address,
              city: input.city || "",
              state: input.state || "TX",
              zip: input.zip || "",
              country: "US",
            },
          ]
        : [],
    };

    const customerRes = await fetch(`${API_BASE}/customers`, {
      method: "POST",
      headers: {
        Authorization: `Token ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(customerPayload),
    });

    if (!customerRes.ok) {
      const errorText = await customerRes.text();
      console.error("HCP customer creation failed:", customerRes.status, errorText);
      return { success: false, error: `Customer creation failed: ${customerRes.status}` };
    }

    const customer = await customerRes.json();

    // Step 2: Create lead
    const leadPayload = {
      customer_id: customer.id,
      notes: `[${input.leadSource}] ${input.message || `Service request: ${input.service || "General inquiry"}`}`,
    };

    const leadRes = await fetch(`${API_BASE}/leads`, {
      method: "POST",
      headers: {
        Authorization: `Token ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(leadPayload),
    });

    if (!leadRes.ok) {
      const errorText = await leadRes.text();
      console.error("HCP lead creation failed:", leadRes.status, errorText);
      // Customer was created even if lead fails — not a total loss
      return { success: true, leadId: customer.id, error: "Lead creation failed but customer created" };
    }

    const lead = await leadRes.json();
    return { success: true, leadId: lead.id };
  } catch (error) {
    console.error("HCP API error:", error);
    return { success: false, error: String(error) };
  }
}
