import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/LegalDocumentPage";
import { legalDocuments } from "@/content/legal-documents";

export const metadata: Metadata = {
  title: "Privacy Policy | Zelos",
  description: legalDocuments.privacy.description,
};

export default function PrivacyPage() {
  return <LegalDocumentPage document={legalDocuments.privacy} />;
}
