import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/LegalDocumentPage";
import { legalDocuments } from "@/content/legal-documents";

export const metadata: Metadata = {
  title: "Shipping Policy | Zelos",
  description: legalDocuments.shipping.description,
};

export default function ShippingPolicyPage() {
  return <LegalDocumentPage document={legalDocuments.shipping} />;
}
