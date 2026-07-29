import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/LegalDocumentPage";
import { legalDocuments } from "@/content/legal-documents";

export const metadata: Metadata = {
  title: "Disclaimer | Zelos",
  description: legalDocuments.disclaimer.description,
};

export default function DisclaimerPage() {
  return <LegalDocumentPage document={legalDocuments.disclaimer} />;
}
