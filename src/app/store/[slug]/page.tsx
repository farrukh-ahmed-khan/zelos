import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProductAddToCart } from "@/components/ProductAddToCart";
import { getProductBySlug, getProducts, serializeProduct } from "@/lib/store/service";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [productDoc, allProductDocs] = await Promise.all([
    getProductBySlug(slug),
    getProducts(),
  ]);

  if (!productDoc) notFound();

  const product = serializeProduct(productDoc);
  const related = allProductDocs
    .map(serializeProduct)
    .filter((p) => p.id !== product.id && p.isActive)
    .slice(0, 3);

  const primaryImage = product.images[0] ?? null;
  const extraImages = product.images.slice(1);

  return (
    <main className="min-h-screen bg-[#eee6d6] text-[#202020]">
      {/* Header inside a branded panel */}
      <div className="px-4 pt-4 sm:px-6 sm:pt-5">
        <div className="relative overflow-hidden rounded-[1.25rem] bg-[#7a0505] px-3 py-4 shadow-[inset_0_0_60px_rgba(0,0,0,0.35)] sm:rounded-[2rem] sm:px-9 sm:py-5 lg:px-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_35%,rgba(194,0,0,0.7),rgba(70,0,0,0.96)_72%)]" />
          <div className="relative z-10">
            <Header />
          </div>
        </div>
      </div>

      <div className="container px-4 pb-6 sm:px-6">
        {/* Breadcrumb */}
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

        {/* Product layout */}
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Left: images */}
          <div>
            <div className="overflow-hidden rounded-2xl bg-white shadow-[0_4px_0_rgba(0,0,0,0.08)]">
              {primaryImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={primaryImage}
                  alt={product.name}
                  className="aspect-square w-full object-cover"
                />
              ) : (
                <div className="flex aspect-square w-full flex-col items-center justify-center gap-3 bg-[#f4f1e9]">
                  <div className="font-bebas text-[5rem] uppercase leading-none text-[#d8d2c5]">
                    Zelos
                  </div>
                  <p className="text-sm text-[#bbb]">No image yet</p>
                </div>
              )}
            </div>

            {extraImages.length > 0 && (
              <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
                {extraImages.map((img, i) => (
                  <div
                    key={i}
                    className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-white shadow-sm"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt={`${product.name} view ${i + 2}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: details */}
          <div className="py-2 lg:py-4">
            <p className="eyebrow-red mb-2">
              {product.isGiftCard
                ? "Gift Card"
                : product.limitedEdition
                  ? "Limited Edition"
                  : "Zelos Store"}
            </p>

            <h1 className="font-bebas text-[clamp(2.8rem,8vw,4.5rem)] uppercase leading-[0.88] text-[#1e1e1e]">
              {product.name}
            </h1>

            <p className="mt-4 font-bebas text-[2rem] text-[#1e1e1e]">
              ${(product.priceCents / 100).toFixed(2)}
            </p>

            {product.description && (
              <p className="mt-4 text-base leading-relaxed text-[#555]">
                {product.description}
              </p>
            )}

            <div className="mt-6 border-t border-[#d8d2c5] pt-6">
              <ProductAddToCart product={product} />
            </div>

            <div className="mt-6 rounded-xl bg-[#8c0504] px-5 py-4">
              <p className="text-sm font-bold text-white">
                Every purchase supports the Zelos mission — helping young people build
                stronger financial futures.
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-xs text-[#888]">
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-[#14bd47]" />
                Secure checkout
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-[#2d93cf]" />
                Ships within 5–7 days
              </span>
              {product.limitedEdition && (
                <span className="flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-full bg-[#b22222]" />
                  Limited edition — while stocks last
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <section className="mt-20 pb-8">
            <p className="eyebrow-red mb-1">Also Available</p>
            <h2 className="home-section-heading mb-8 bg-[linear-gradient(198deg,#B22222_0%,#1D1D1D_25%)] bg-clip-text text-transparent [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
              More From The Store
            </h2>
            <div className="row g-4">
              {related.map((relProd) => (
                <div className="col-12 col-md-6 col-lg-4" key={relProd.id}>
                  <Link
                    href={`/store/${relProd.slug}`}
                    className="block h-full overflow-hidden rounded-2xl bg-white p-4 shadow-[0_4px_0_rgba(0,0,0,0.08)] transition hover:shadow-[0_6px_20px_rgba(0,0,0,0.12)]"
                  >
                    <div className="overflow-hidden rounded-xl bg-[#f4f1e9]">
                      {relProd.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={relProd.images[0]}
                          alt={relProd.name}
                          className="aspect-square w-full object-cover"
                        />
                      ) : (
                        <div className="flex aspect-square w-full items-center justify-center">
                          <span className="font-bebas text-3xl uppercase text-[#d8d2c5]">
                            Zelos
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4">
                      <p className="mb-1 text-xs font-bold uppercase text-[#b22222]">
                        {relProd.limitedEdition ? "Limited Edition" : "Zelos Gear"}
                      </p>
                      <h3 className="font-bebas text-[1.6rem] uppercase leading-none text-[#202020]">
                        {relProd.name}
                      </h3>
                      {relProd.description && (
                        <p className="mt-1 text-sm leading-relaxed text-[#9b9b9b] line-clamp-2">
                          {relProd.description}
                        </p>
                      )}
                      <div className="mt-3 flex items-center justify-between">
                        <p className="font-bebas text-[1.3rem] text-[#202020]">
                          ${(relProd.priceCents / 100).toFixed(2)}
                        </p>
                        <span className="text-sm font-bold text-[#b22222]">Shop Now →</span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </main>
  );
}
