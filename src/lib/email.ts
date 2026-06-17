import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const NOTIFY_EMAIL = "justin@wasatch-plumbing-demo.vercel.app";
const FROM_EMAIL = "leads@mail.linfordy.com";

interface LeadNotificationInput {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address?: string;
  city?: string;
  zip?: string;
  service?: string;
  message?: string;
  page: string;
  source: string;
}

export async function sendLeadNotification(input: LeadNotificationInput): Promise<void> {
  if (!resend) {
    console.error("RESEND_API_KEY not set — skipping email notification");
    return;
  }

  try {
    await resend.emails.send({
      from: `Wasatch Plumbing Co. Leads <${FROM_EMAIL}>`,
      to: NOTIFY_EMAIL,
      subject: `New Lead: ${input.firstName} ${input.lastName} — ${input.service || "General Inquiry"}`,
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #111; color: #fff; border-radius: 12px; overflow: hidden;">
          <div style="background: #c41e1e; padding: 20px 24px;">
            <h1 style="margin: 0; font-size: 20px; color: #fff;">New Website Lead</h1>
          </div>
          <div style="padding: 24px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #888; width: 120px;">Name</td>
                <td style="padding: 8px 0; font-weight: bold;">${input.firstName} ${input.lastName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #888;">Phone</td>
                <td style="padding: 8px 0;"><a href="tel:${input.phone}" style="color: #c41e1e; text-decoration: none; font-weight: bold;">${input.phone}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #888;">Email</td>
                <td style="padding: 8px 0;"><a href="mailto:${input.email}" style="color: #c41e1e; text-decoration: none;">${input.email}</a></td>
              </tr>
              ${input.service ? `<tr><td style="padding: 8px 0; color: #888;">Service</td><td style="padding: 8px 0;">${input.service}</td></tr>` : ""}
              ${input.address ? `<tr><td style="padding: 8px 0; color: #888;">Address</td><td style="padding: 8px 0;">${input.address}${input.city ? `, ${input.city}` : ""}${input.zip ? ` ${input.zip}` : ""}</td></tr>` : ""}
              ${input.message ? `<tr><td style="padding: 8px 0; color: #888; vertical-align: top;">Message</td><td style="padding: 8px 0;">${input.message}</td></tr>` : ""}
              <tr>
                <td style="padding: 8px 0; color: #888;">Source</td>
                <td style="padding: 8px 0; color: #888;">${input.source}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #888;">Page</td>
                <td style="padding: 8px 0; color: #888;">${input.page}</td>
              </tr>
            </table>
            <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #222;">
              <a href="tel:${input.phone}" style="display: inline-block; background: #c41e1e; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Call ${input.firstName} Now</a>
            </div>
          </div>
          <div style="padding: 16px 24px; background: #0a0a0a; color: #555; font-size: 12px;">
            Wasatch Plumbing Co. — wasatch-plumbing-demo.vercel.app
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send lead notification email:", error);
    // Don't throw — email failure should never break form submission
  }
}
