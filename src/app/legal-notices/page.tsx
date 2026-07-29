import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/LegalDocumentPage";
import { legalDocuments } from "@/content/legal-documents";

export const metadata: Metadata = {
  title: "Legal Notices | Zelos",
  description: legalDocuments.notices.description,
};

export default function LegalNoticesPage() {
  return <LegalDocumentPage document={legalDocuments.notices} />;
}
