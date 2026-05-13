import { notFound } from "next/navigation";
import { ProductCheckoutForm } from "@/components/ProductCheckoutForm";
import { getProductBySlug, serializeProduct } from "@/lib/store/service";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const productDoc = await getProductBySlug(slug);
  if (!productDoc) notFound();
  const product = serializeProduct(productDoc);

  return (
    <main className="min-h-screen bg-[#eee6d6] px-4 py-12 text-[#202020]">
      <section className="container max-w-[1040px]">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="aspect-square rounded-md border-2 border-[#212121] bg-[#f4f1e9] shadow-[0_4px_0_#111]" />
          <div>
            <p className="eyebrow-red">{product.limitedEdition ? "Limited Edition" : "Store"}</p>
            <h1 className="font-bebas text-[clamp(3rem,7vw,5rem)] uppercase leading-[0.86]">{product.name}</h1>
            <p className="mt-3 text-2xl font-black">${(product.priceCents / 100).toFixed(2)}</p>
            <p className="mt-4 text-sm leading-relaxed">{product.description}</p>
            <div className="mt-6">
              <ProductCheckoutForm productId={product.id} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
