import { cookies } from "next/headers";
import { getProducts, serializeProduct } from "@/lib/store/service";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { verifyAuthToken } from "@/lib/auth/jwt";
import { CheckoutView } from "./CheckoutView";

export const dynamic = "force-dynamic";

function splitName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

export default async function CheckoutPage() {
  const products = (await getProducts()).map(serializeProduct);
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  const payload = token ? await verifyAuthToken(token).catch(() => null) : null;
  const contact = payload
    ? {
        ...splitName(payload.name),
        email: payload.email,
      }
    : undefined;
  const imageMap: Record<string, string> = {};
  for (const p of products) {
    if (p.images[0]) imageMap[p.id] = p.images[0];
  }
  return <CheckoutView contact={contact} imageMap={imageMap} />;
}
