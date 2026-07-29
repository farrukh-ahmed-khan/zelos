import { ActiveScholarships } from "@/components/ActiveScholarships";
import { CommunityForumPreview } from "@/components/CommunityForumPreview";
import { Footer } from "@/components/Footer";
import { HeroBanner } from "@/components/HeroBanner";
import { HomeScrollReset } from "@/components/HomeScrollReset";
import { MiddleBanner } from "@/components/MiddleBanner";
import { NonprofitSupport } from "@/components/NonprofitSupport";
import { ProgramsOverview } from "@/components/ProgramsOverview";
import { SwagStoreHighlight } from "@/components/SwagStoreHighlight";
import { UpcomingEvents } from "@/components/UpcomingEvents";
import { WatchVideoSection } from "@/components/WatchVideoSection";
import { getProducts, serializeProduct } from "@/lib/store/service";
import { getHomepageMissionVideo } from "@/lib/videos/service";

type StoreProduct = ReturnType<typeof serializeProduct>;

const HOME_SWAG_FEATURES = [
  {
    preferredSlug: "zelos-shield-logo-snapback-embroidered-flat-brim-hat",
    namePattern: /\b(?:hat|cap|snapback)\b/i,
  },
  {
    preferredSlug: "zelos-shield-logo-t-shirt-financial-literacy-mentoring",
    namePattern: /\b(?:t-?shirt|shirt|tee|polo)\b/i,
  },
  {
    preferredSlug: "zelos-shield-logo-hoodie-minimal-monogram-z-emblem-sweatshirt",
    namePattern: /\bhoodie\b/i,
  },
];

function selectHomeSwagProducts(products: StoreProduct[]) {
  const selectedIds = new Set<string>();

  const featuredProducts = HOME_SWAG_FEATURES.flatMap(
    ({ preferredSlug, namePattern }) => {
      const preferred = products.find(
        (product) =>
          product.slug === preferredSlug &&
          product.isActive &&
          !product.isGiftCard &&
          !selectedIds.has(product.id),
      );
      const fallback = products.find(
        (product) =>
          product.isActive &&
          !product.isGiftCard &&
          !selectedIds.has(product.id) &&
          namePattern.test(product.name),
      );
      const product = preferred ?? fallback;

      if (!product) {
        return [];
      }

      selectedIds.add(product.id);
      return [product];
    },
  );

  const additionalProducts = products
    .filter(
      (product) =>
        product.isActive &&
        !product.isGiftCard &&
        !selectedIds.has(product.id),
    )
    .slice(0, 3);

  return [...featuredProducts, ...additionalProducts];
}

export default async function Home() {
  const [storeProducts, missionVideo] = await Promise.all([
    getProducts()
      .then((docs) => selectHomeSwagProducts(docs.map(serializeProduct)))
      .catch(() => []),
    getHomepageMissionVideo().catch(() => null),
  ]);

  return (
    <main className="min-h-screen bg-[#eee6d6] text-white">
      <HomeScrollReset />
      <div className="padding-sections p-4 sm:p-6">
        <HeroBanner />
      </div>
      <WatchVideoSection missionVideo={missionVideo} />
      <div className="padding-sections p-4 sm:p-6">
        <ProgramsOverview />
      </div>
      <ActiveScholarships />
      <UpcomingEvents />
      <CommunityForumPreview />
      <MiddleBanner />
      <SwagStoreHighlight products={storeProducts} />
      <NonprofitSupport />
      <Footer />
    </main>
  );
}
