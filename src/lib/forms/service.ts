import { connectToDatabase } from "@/lib/db";
import { queueEmail } from "@/lib/notifications/service";
import FormSubmission from "@/models/FormSubmission";

export async function createFormSubmission(params: {
  type: "contact" | "school-demo" | "scholarship-inquiry" | "data-access" | "data-deletion";
  name: string;
  email: string;
  category?: string;
  message: string;
  metadata?: Record<string, unknown>;
}) {
  await connectToDatabase();
  const submission = await FormSubmission.create({
    ...params,
    category: params.category || null,
    metadata: params.metadata ?? {},
  });
  await queueEmail({
    template: `${params.type}-confirmation`,
    recipient: params.email,
    payload: { name: params.name, submissionId: submission._id.toString() },
  });
  return submission;
}

export async function getFormSubmissions(type?: string | null) {
  await connectToDatabase();
  return FormSubmission.find(type ? { type } : {}).sort({ createdAt: -1 }).lean();
}
