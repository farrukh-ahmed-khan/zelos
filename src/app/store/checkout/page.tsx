import { getProducts, serializeProduct } from "@/lib/store/service";
import { CheckoutView } from "./CheckoutView";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const products = (await getProducts()).map(serializeProduct);
  const imageMap: Record<string, string> = {};
  for (const p of products) {
    if (p.images[0]) imageMap[p.id] = p.images[0];
  }
  return <CheckoutView imageMap={imageMap} />;
}
