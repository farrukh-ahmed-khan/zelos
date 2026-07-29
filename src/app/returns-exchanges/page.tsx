import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/LegalDocumentPage";
import { legalDocuments } from "@/content/legal-documents";

export const metadata: Metadata = {
  title: "Returns & Exchanges | Zelos",
  description: legalDocuments.returns.description,
};

export default function ReturnsExchangesPage() {
  return <LegalDocumentPage document={legalDocuments.returns} />;
}
