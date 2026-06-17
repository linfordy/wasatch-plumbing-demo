export interface FormSubmission {
  id: string;
  form_type: string;
  data: Record<string, unknown>;
  attribution: Record<string, unknown> | null;
  submitted_at: string;
  page: string;
}

export async function logSubmission(submission: FormSubmission): Promise<void> {
  // Always log to console (Vercel captures these)
  console.log(
    JSON.stringify({
      type: "FORM_SUBMISSION",
      ...submission,
    })
  );
}
