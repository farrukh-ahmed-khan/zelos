import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { StoreCart } from "@/components/StoreCart";
import { getProducts, serializeProduct } from "@/lib/store/service";

export const dynamic = "force-dynamic";

export default async function StorePage() {
  const products = (await getProducts()).map(serializeProduct);

  return (
    <main className="min-h-screen bg-[#eee6d6] px-4 py-12 text-[#202020]">
      <Header />
      <section className="container mt-12">
        <p className="eyebrow-red">Swag Store</p>
        <h1 className="font-bebas text-[clamp(3rem,7vw,5rem)] uppercase leading-[0.86]">Zelos Store</h1>
        <div className="mt-4 flex flex-wrap gap-3">
          {products.map((product) => (
            <Link key={product.id} href={`/store/${product.slug}`} className="text-sm font-black !text-[#8c0504] underline">
              View {product.name}
            </Link>
          ))}
        </div>
        <div className="mt-6">
          <StoreCart products={products} />
        </div>
        <div className="mt-10 rounded-md bg-[#8c0504] p-5 text-sm font-bold text-white">
          Every purchase supports the Zelos mission.
        </div>
      </section>
      <Footer />
    </main>
  );
}
