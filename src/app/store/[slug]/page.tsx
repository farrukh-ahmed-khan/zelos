import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProductDetailView } from "@/components/ProductDetailView";
import { getProductBySlug, getProducts, serializeProduct } from "@/lib/store/service";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [productDoc, allProductDocs] = await Promise.all([getProductBySlug(slug), getProducts()]);

  if (!productDoc) notFound();

  const product = serializeProduct(productDoc);
  const related = allProductDocs
    .map(serializeProduct)
    .filter((candidate) => candidate.id !== product.id && candidate.isActive)
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-[#eee6d6] text-[#202020]">
      <div className="px-4 pt-4 sm:px-6 sm:pt-5">
        <div className="relative overflow-hidden rounded-[1.25rem] bg-[#7a0505] px-3 py-4 shadow-[inset_0_0_60px_rgba(0,0,0,0.35)] sm:rounded-[2rem] sm:px-9 sm:py-5 lg:px-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_35%,rgba(194,0,0,0.7),rgba(70,0,0,0.96)_72%)]" />
          <div className="relative z-10">
            <Header />
          </div>
        </div>
      </div>

      <div className="container px-4 pb-16 sm:px-6">
        <nav className="flex items-center gap-1.5 py-5 text-sm text-[#777]">
          <Link href="/" className="transition hover:text-[#b22222]">
            Home
          </Link>
          <span>/</span>
          <Link href="/store" className="transition hover:text-[#b22222]">
            Store
          </Link>
          <span>/</span>
          <span className="font-semibold text-[#202020]">{product.name}</span>
        </nav>

        <ProductDetailView
          product={JSON.parse(JSON.stringify(product))}
          related={JSON.parse(JSON.stringify(related))}
        />
      </div>

      <Footer />
    </main>
  );
}
