import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { CartButton } from "@/components/CartButton";
import { getProducts, serializeProduct } from "@/lib/store/service";

export const dynamic = "force-dynamic";

type SerializedProduct = ReturnType<typeof serializeProduct>;

export default async function StorePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const products = (await getProducts()).map(serializeProduct);
  const { checkout } = await searchParams;
  const activeProducts = products.filter((p) => p.isActive && !p.isGiftCard);
  const giftCards = products.filter((p) => p.isActive && p.isGiftCard);

  return (
    <main className="min-h-screen bg-[#eee6d6] text-[#202020]">
      {/* Branded red header */}
      <div className="px-4 pt-4 sm:px-6 sm:pt-5">
        <div className="relative overflow-hidden rounded-[1.25rem] bg-[#7a0505] px-3 py-4 shadow-[inset_0_0_60px_rgba(0,0,0,0.35)] sm:rounded-[2rem] sm:px-9 sm:py-5 lg:px-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_35%,rgba(194,0,0,0.7),rgba(70,0,0,0.96)_72%)]" />
          <div className="relative z-10">
            <Header />
          </div>
        </div>
      </div>

      <div className="container px-4 pb-20 sm:px-6">
        {/* Checkout status banners */}
        {checkout === "success" && (
          <div className="mt-6 rounded-xl border border-[#b7e4c7] bg-[#eef8e8] px-5 py-4 text-sm font-bold text-[#1a5c2e]">
            ✓ Order confirmed! Check your email for details.
          </div>
        )}
        {checkout === "cancelled" && (
          <div className="mt-6 rounded-xl border border-[#f4c5c5] bg-[#fff3f3] px-5 py-4 text-sm font-bold text-[#8c0504]">
            Checkout was cancelled. Your cart is still saved.
          </div>
        )}

        {/* Hero */}
        <div className="mt-10 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow-red">Swag Store</p>
            <h1 className="font-bebas text-[clamp(3rem,8vw,5.5rem)] uppercase leading-[0.86] text-[#1e1e1e]">
              Zelos Store
            </h1>
            <p className="mt-2 max-w-lg text-base leading-relaxed text-[#666]">
              Every purchase directly supports our mission — empowering young people with
              real financial knowledge.
            </p>
          </div>
          <div className="mt-3 shrink-0">
            <CartButton />
          </div>
        </div>

        {/* Products grid */}
        {activeProducts.length > 0 ? (
          <section className="mt-12">
            <div className="mb-6 flex items-center gap-3">
              <p className="eyebrow-red">All Products</p>
              <span className="rounded-full bg-[#d8d2c5] px-2.5 py-0.5 text-xs font-black text-[#202020]">
                {activeProducts.length}
              </span>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {activeProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        ) : (
          <div className="mt-16 rounded-2xl border-2 border-dashed border-[#c8c2b5] py-20 text-center">
            <p className="font-bebas text-4xl uppercase text-[#c8c2b5]">Coming Soon</p>
            <p className="mt-2 text-sm text-[#999]">New products are on the way.</p>
          </div>
        )}

        {/* Gift cards */}
        {giftCards.length > 0 && (
          <section className="mt-20">
            <p className="eyebrow-red mb-1">Digital Delivery</p>
            <h2 className="font-bebas text-[clamp(2rem,5vw,3.5rem)] uppercase leading-none text-[#1e1e1e]">
              Gift Cards
            </h2>
            <p className="mt-1 text-sm text-[#777]">
              Give the gift of financial education. Delivered instantly by email.
            </p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {giftCards.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Mission callout */}
        <div className="mt-20 overflow-hidden rounded-2xl bg-[#1e1e1e]">
          <div className="relative px-7 py-10 sm:px-12 sm:py-12">
            <div className="absolute right-0 top-0 h-full w-1/3 bg-[radial-gradient(circle_at_80%_50%,rgba(140,5,4,0.6),transparent_70%)]" />
            <div className="relative">
              <p className="eyebrow-white mb-3">Why It Matters</p>
              <h2 className="font-bebas text-[clamp(2.2rem,5vw,3.8rem)] uppercase leading-none text-white">
                Support the Mission
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-[#b0a898]">
                Zelos is a nonprofit fighting financial illiteracy. Every hoodie, tee, and gift
                card sold funds our programs, scholarships, and community events — giving young
                people the tools to build real wealth.
              </p>
              <Link
                href="/mission-video"
                className="mt-6 inline-flex items-center gap-2 rounded-md border-2 border-[#faff8d] bg-[#faff8d] px-5 py-2.5 text-sm font-black text-[#212121]! shadow-[0_4px_0_rgba(250,255,141,0.3)] transition hover:bg-[#fff176]"
              >
                Learn Our Mission →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

function ProductCard({ product }: { product: SerializedProduct }) {
  const image = product.images[0];
  const activeVariants = (product.variants ?? []).filter((v) => v.isActive !== false);
  const totalInventory = activeVariants.length
    ? activeVariants.reduce((t, v) => t + v.inventoryCount, 0)
    : product.inventoryCount;
  const outOfStock = !product.isGiftCard && totalInventory <= 0;

  return (
    <Link
      href={`/store/${product.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-[#212121] bg-white shadow-[0_4px_0_#111] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.14)]"
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-[#f4f1e9]">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={product.name}
            className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex aspect-[4/3] w-full items-center justify-center">
            <span className="font-bebas text-5xl uppercase text-[#d8d2c5]">Zelos</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute left-3 top-3 flex gap-2">
          {product.limitedEdition && (
            <span className="rounded-sm bg-[#8c0504] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
              Limited
            </span>
          )}
          {outOfStock && (
            <span className="rounded-sm bg-[#555] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
              Sold Out
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <p className="mb-1 text-[11px] font-black uppercase tracking-wider text-[#b22222]">
          {product.isGiftCard ? "Gift Card" : product.limitedEdition ? "Limited Edition" : "Zelos Gear"}
        </p>
        <h2 className="font-bebas text-[1.75rem] uppercase leading-none text-[#1e1e1e]">
          {product.name}
        </h2>
        {product.description && (
          <p className="mt-1.5 flex-1 text-sm leading-relaxed text-[#777] line-clamp-2">
            {product.description}
          </p>
        )}
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="font-bebas text-[1.6rem] leading-none text-[#202020]">
            ${(product.priceCents / 100).toFixed(2)}
          </p>
          <span className="inline-flex items-center gap-1 rounded-md border-2 border-[#212121] bg-[#faff8d] px-3 py-1.5 text-[13px] font-black text-[#212121]! shadow-[0_2px_0_#111] transition group-hover:shadow-[0_3px_0_#111]">
            Shop Now →
          </span>
        </div>
      </div>
    </Link>
  );
}
