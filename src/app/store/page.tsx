import Link from "next/link";
import { Header } from "@/components/Header";
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
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Link key={product.id} href={`/store/${product.slug}`} className="rounded-md border-2 border-[#212121] bg-white p-4 !text-[#202020] shadow-[0_4px_0_#111]">
              <div className="aspect-[4/3] rounded-md bg-[#f4f1e9]" />
              <p className="mt-3 text-xs font-black uppercase text-[#b22222]">{product.limitedEdition ? "Limited Edition" : "Zelos Gear"}</p>
              <h2 className="font-bebas text-3xl uppercase leading-none">{product.name}</h2>
              <p className="font-bold">${(product.priceCents / 100).toFixed(2)}</p>
            </Link>
          ))}
        </div>
        <div className="mt-10 rounded-md bg-[#8c0504] p-5 text-sm font-bold text-white">
          Every purchase supports the Zelos mission.
        </div>
      </section>
    </main>
  );
}
