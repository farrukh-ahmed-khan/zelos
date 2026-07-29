import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/LegalDocumentPage";
import { legalDocuments } from "@/content/legal-documents";

export const metadata: Metadata = {
  title: "FAQ | Zelos",
  description: legalDocuments.faq.description,
};

export default function FaqPage() {
  return <LegalDocumentPage document={legalDocuments.faq} />;
}
