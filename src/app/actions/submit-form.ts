"use server";

import { createHousecallProLead } from "@/lib/housecall-pro";
import { logSubmission } from "@/lib/form-logger";
import { sendLeadNotification } from "@/lib/email";

interface SubmitFormInput {
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
  formType: string;
  page: string;
  attribution: Record<string, unknown> | null;
  honeypot?: string;
  timestamp?: number;
}

interface SubmitFormResult {
  success: boolean;
  error?: string;
}

export async function submitForm(input: SubmitFormInput): Promise<SubmitFormResult> {
  // Spam detection
  if (input.honeypot) {
    console.log("Spam detected: honeypot filled");
    return { success: true }; // Silent success to fool bots
  }

  if (input.timestamp && Date.now() - input.timestamp < 3000) {
    console.log("Spam detected: submitted too fast");
    return { success: true };
  }

  // 1. Log locally (never lose a lead)
  await logSubmission({
    id: crypto.randomUUID(),
    form_type: input.formType,
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      email: input.email,
      address: input.address,
      city: input.city,
      state: input.state,
      zip: input.zip,
      service: input.service,
      message: input.message,
    },
    attribution: input.attribution,
    submitted_at: new Date().toISOString(),
    page: input.page,
  });

  // 2. Sync to HouseCall Pro (don't fail the form if CRM sync fails)
  const leadSource = input.attribution
    ? `WasatchWebsite${(input.attribution.first_touch as Record<string, string>)?.utm_source ? ` | ${(input.attribution.first_touch as Record<string, string>).utm_source}` : ""}`
    : "WasatchWebsite";

  const crmResult = await createHousecallProLead({
    firstName: input.firstName,
    lastName: input.lastName,
    phone: input.phone,
    email: input.email,
    address: input.address,
    city: input.city,
    state: input.state,
    zip: input.zip,
    service: input.service,
    message: input.message,
    leadSource,
    attribution: input.attribution,
  });

  if (!crmResult.success) {
    console.error("CRM sync failed:", crmResult.error);
    // Don't fail the form — lead is already logged
  }

  // 3. Email notification to Justin (don't fail the form if email fails)
  await sendLeadNotification({
    firstName: input.firstName,
    lastName: input.lastName,
    phone: input.phone,
    email: input.email,
    address: input.address,
    city: input.city,
    zip: input.zip,
    service: input.service,
    message: input.message,
    page: input.page,
    source: leadSource,
  });

  return { success: true };
}
