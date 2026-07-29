import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/LegalDocumentPage";
import { legalDocuments } from "@/content/legal-documents";

export const metadata: Metadata = {
  title: "Subscription Terms | Zelos",
  description: legalDocuments.subscriptionTerms.description,
};

export default function SubscriptionTermsPage() {
  return <LegalDocumentPage document={legalDocuments.subscriptionTerms} />;
}
