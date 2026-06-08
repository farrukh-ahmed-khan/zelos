import { getProducts, serializeProduct } from "@/lib/store/service";
import { CartView } from "./CartView";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const products = (await getProducts()).map(serializeProduct);
  const imageMap: Record<string, string> = {};
  for (const p of products) {
    if (p.images[0]) imageMap[p.id] = p.images[0];
  }
  return <CartView imageMap={imageMap} />;
}
