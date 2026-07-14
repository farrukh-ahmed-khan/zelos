import nextEnv from "@next/env";
import mongoose from "mongoose";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const products = [
  {
    name: "Zelos Signature Hoodie",
    slug: "zelos-signature-hoodie",
    description:
      "A heavyweight navy fleece hoodie with a soft brushed interior and embroidered Zelos chest mark. Built for everyday comfort while supporting financial education for young people.",
    priceCents: 4500,
    images: ["/assets/product-zelos-hoodie.png"],
    sizes: ["S", "M", "L", "XL", "2XL"],
    colors: ["Navy"],
    variants: ["S", "M", "L", "XL", "2XL"].map((size, index) => ({
      sku: `ZE-HOOD-NV-${size}`,
      size,
      color: "Navy",
      inventoryCount: [8, 12, 14, 10, 6][index],
      priceAdjustmentCents: size === "2XL" ? 300 : 0,
      isActive: true,
    })),
    inventoryCount: 50,
    limitedEdition: false,
    isActive: true,
    isGiftCard: false,
  },
  {
    name: "Money Minds Tee (Youth)",
    slug: "money-minds-youth-tee",
    description:
      "A soft cream youth tee featuring Zelos and a bold growth graphic. A comfortable conversation starter for the next generation of confident money minds.",
    priceCents: 2200,
    images: ["/assets/product-money-minds-tee.png"],
    sizes: ["Youth S", "Youth M", "Youth L", "Youth XL"],
    colors: ["Cream"],
    variants: ["Youth S", "Youth M", "Youth L", "Youth XL"].map((size, index) => ({
      sku: `ZE-TEE-CR-${["YS", "YM", "YL", "YXL"][index]}`,
      size,
      color: "Cream",
      inventoryCount: [10, 14, 12, 8][index],
      priceAdjustmentCents: 0,
      isActive: true,
    })),
    inventoryCount: 44,
    limitedEdition: false,
    isActive: true,
    isGiftCard: false,
  },
  {
    name: "Zelos Cap — Limited Edition",
    slug: "zelos-limited-edition-cap",
    description:
      "A structured deep-red cotton-twill cap finished with cream Zelos embroidery and an adjustable back closure. Produced in a small run while supplies last.",
    priceCents: 2800,
    images: ["/assets/product-zelos-cap.png"],
    sizes: ["One Size"],
    colors: ["Zelos Red"],
    variants: [
      {
        sku: "ZE-CAP-RD-OS",
        size: "One Size",
        color: "Zelos Red",
        inventoryCount: 25,
        priceAdjustmentCents: 0,
        isActive: true,
      },
    ],
    inventoryCount: 25,
    limitedEdition: true,
    isActive: true,
    isGiftCard: false,
  },
];

async function seedStoreProducts() {
  if (!process.env.MONGODB_URI) {
    throw new Error("Missing MONGODB_URI environment variable.");
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: "zelos",
    bufferCommands: false,
  });

  const collection = mongoose.connection.collection("products");
  const now = new Date();
  let inserted = 0;

  for (const product of products) {
    const result = await collection.updateOne(
      { slug: product.slug },
      {
        $setOnInsert: {
          ...product,
          createdAt: now,
          updatedAt: now,
        },
      },
      { upsert: true },
    );

    inserted += result.upsertedCount;
  }

  console.log(
    `Store seed complete: ${inserted} inserted, ${products.length - inserted} already existed.`,
  );
}

try {
  await seedStoreProducts();
} finally {
  await mongoose.disconnect();
}
