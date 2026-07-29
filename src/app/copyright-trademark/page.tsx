import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/LegalDocumentPage";
import { legalDocuments } from "@/content/legal-documents";

export const metadata: Metadata = {
  title: "Copyright & Trademark | Zelos",
  description: legalDocuments.copyright.description,
};

export default function CopyrightTrademarkPage() {
  return <LegalDocumentPage document={legalDocuments.copyright} />;
}
