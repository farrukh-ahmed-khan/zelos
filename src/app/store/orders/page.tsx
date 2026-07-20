import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { AUTH_COOKIE_NAME } from "@/lib/auth/cookies";
import { verifyAuthToken } from "@/lib/auth/jwt";
import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, { label: string; bg: string; text: string }> = {
  pending:    { label: "Pending",    bg: "bg-[#f4f4f4]",    text: "text-[#888]" },
  paid:       { label: "Paid",       bg: "bg-[#e8f0fe]",    text: "text-[#2d5fd4]" },
  processing: { label: "Processing", bg: "bg-[#fff8e1]",    text: "text-[#b06a00]" },
  shipped:    { label: "Shipped",    bg: "bg-[#e3f2fd]",    text: "text-[#1976d2]" },
  delivered:  { label: "Delivered",  bg: "bg-[#e8f5e9]",    text: "text-[#2e7d32]" },
  cancelled:  { label: "Cancelled",  bg: "bg-[#fce4ec]",    text: "text-[#c62828]" },
};

function money(cents: number) {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? { label: status, bg: "bg-[#f4f4f4]", text: "text-[#888]" };
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

type SerializedAddress = {
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  zip: string;
  country?: string | null;
} | null;

function AddressBlock({ address, label }: { address: SerializedAddress; label: string }) {
  if (!address) return null;
  return (
    <div>
      <p className="mb-1 text-[11px] font-black uppercase tracking-wider text-[#999]">{label}</p>
      <p className="text-sm text-[#555]">
        {address.line1}
        {address.line2 ? `, ${address.line2}` : ""}
      </p>
      <p className="text-sm text-[#555]">
        {address.city}, {address.state} {address.zip}
        {address.country ? ` · ${address.country}` : ""}
      </p>
    </div>
  );
}

export default async function OrderHistoryPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) redirect("/login?next=/store/orders");

  let userId: string;
  let userEmail: string;
  try {
    const payload = await verifyAuthToken(token);
    userId = payload.sub;
    userEmail = payload.email;
  } catch {
    redirect("/login?next=/store/orders");
  }

  await connectToDatabase();
  const orders = await Order.find({
    $or: [{ userId }, { email: userEmail }],
  })
    .sort({ createdAt: -1 })
    .lean();

  const serialized = orders.map((order) => ({
    id: order._id.toString(),
    status: order.status,
    totalCents: order.totalCents,
    subtotalCents: order.subtotalCents,
    discountCents: order.discountCents ?? 0,
    giftCardCode: order.giftCardCode ?? null,
    items: order.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
      size: item.size ?? null,
      color: item.color ?? null,
    })),
    shippingAddress: (order.shippingAddress as SerializedAddress) ?? null,
    billingAddress: (order.billingAddress as SerializedAddress) ?? null,
    printify: order.printify ?? null,
    paidAt: order.paidAt?.toISOString() ?? null,
    createdAt: order.createdAt?.toISOString() ?? new Date().toISOString(),
  }));

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
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 py-5 text-sm text-[#888]">
          <Link href="/" className="transition hover:text-[#b22222]">Home</Link>
          <span>/</span>
          <Link href="/store" className="transition hover:text-[#b22222]">Store</Link>
          <span>/</span>
          <span className="font-semibold text-[#202020]">My Orders</span>
        </nav>

        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow-red">Account</p>
            <h1 className="font-bebas text-[clamp(2.5rem,7vw,4.5rem)] uppercase leading-[0.86]">
              My Orders
            </h1>
          </div>
          <Link
            href="/store"
            className="rounded-md border-2 border-[#212121] bg-[#faff8d] px-4 py-2.5 text-sm font-black text-[#212121]! shadow-[0_3px_0_#111] transition hover:bg-[#fff176]"
          >
            Continue Shopping →
          </Link>
        </div>

        {serialized.length === 0 ? (
          <div className="rounded-2xl border-2 border-[#d8d2c5] bg-white px-8 py-20 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#f4f1e9]">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#b22222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <p className="font-bebas text-3xl uppercase text-[#bbb]">No orders yet</p>
            <p className="mt-2 text-sm text-[#999]">Your orders will appear here once you make a purchase.</p>
            <Link
              href="/store"
              className="mt-6 inline-flex items-center gap-2 rounded-md border-2 border-[#212121] bg-[#faff8d] px-6 py-3 text-sm font-black text-[#212121]! shadow-[0_4px_0_#111] transition hover:bg-[#fff176]"
            >
              Browse Store →
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {serialized.map((order) => (
              <article
                key={order.id}
                className="overflow-hidden rounded-2xl border-2 border-[#212121] bg-white shadow-[0_4px_0_#111]"
              >
                {/* Order header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8e3da] bg-[#f9f6f1] px-5 py-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-[#999]">Order ID</p>
                      <p className="font-mono text-sm font-bold text-[#202020]">
                        #{order.id.slice(-8).toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-[#999]">Placed</p>
                      <p className="text-sm font-bold text-[#202020]">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    {order.paidAt && (
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-[#999]">Paid</p>
                        <p className="text-sm font-bold text-[#202020]">
                          {new Date(order.paidAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={order.status} />
                    <span className="font-bebas text-2xl text-[#202020]">{money(order.totalCents)}</span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
                    {/* Items */}
                    <div>
                      <p className="mb-3 text-[11px] font-black uppercase tracking-wider text-[#999]">Items</p>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between gap-3 rounded-lg bg-[#f9f6f1] px-4 py-2.5">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold">{item.name}</p>
                              {(item.size || item.color) && (
                                <p className="text-xs text-[#999]">
                                  {[item.size, item.color].filter(Boolean).join(" / ")}
                                </p>
                              )}
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="text-sm font-black">{money(item.unitPriceCents * item.quantity)}</p>
                              <p className="text-xs text-[#999]">Qty {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Price breakdown */}
                      <div className="mt-4 space-y-1.5 border-t border-[#e8e3da] pt-4 text-sm">
                        <div className="flex justify-between text-[#666]">
                          <span>Subtotal</span>
                          <span>{money(order.subtotalCents)}</span>
                        </div>
                        {order.discountCents > 0 && (
                          <div className="flex justify-between text-[#2e7d32]">
                            <span>Gift Card {order.giftCardCode ? `(${order.giftCardCode})` : ""}</span>
                            <span>−{money(order.discountCents)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-black text-[#202020]">
                          <span>Total Paid</span>
                          <span>{money(order.totalCents)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Addresses */}
                    {(order.shippingAddress || order.billingAddress) && (
                      <div className="flex flex-col gap-5 min-w-[200px]">
                        {order.shippingAddress && (
                          <AddressBlock address={order.shippingAddress} label="Shipping To" />
                        )}
                        {order.billingAddress &&
                          JSON.stringify(order.billingAddress) !== JSON.stringify(order.shippingAddress) && (
                            <AddressBlock address={order.billingAddress} label="Billing Address" />
                          )}
                      </div>
                    )}
                  </div>

                  {order.printify?.shipments?.length ? (
                    <div className="mt-5 border-t border-[#e8e3da] pt-5">
                      <p className="mb-3 text-[11px] font-black uppercase tracking-wider text-[#999]">Tracking</p>
                      <div className="grid gap-2">
                        {order.printify.shipments.map((shipment, index) => (
                          <div key={`${shipment.number ?? index}`} className="rounded-lg bg-[#f9f6f1] px-4 py-3 text-sm">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="font-bold text-[#202020]">
                                {[shipment.carrier, shipment.number].filter(Boolean).join(" ")}
                              </span>
                              {shipment.url ? (
                                <a href={shipment.url} target="_blank" rel="noreferrer" className="font-black text-[#8c0504]! underline underline-offset-2">
                                  Track package
                                </a>
                              ) : null}
                            </div>
                            {shipment.deliveredAt ? (
                              <p className="mt-1 text-xs text-[#667085]">
                                Delivered {new Date(shipment.deliveredAt).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </p>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {/* Status progress */}
                  <div className="mt-5 border-t border-[#e8e3da] pt-5">
                    <p className="mb-3 text-[11px] font-black uppercase tracking-wider text-[#999]">Order Progress</p>
                    <div className="flex items-center gap-1 overflow-x-auto">
                      {["paid", "processing", "shipped", "delivered"].map((step, idx, arr) => {
                        const stepOrder = ["pending", "paid", "processing", "shipped", "delivered"];
                        const currentIdx = stepOrder.indexOf(order.status);
                        const stepIdx = stepOrder.indexOf(step);
                        const isComplete = currentIdx >= stepIdx && order.status !== "cancelled";
                        const isCurrent = currentIdx === stepIdx;

                        return (
                          <div key={step} className="flex items-center">
                            <div className={`flex flex-col items-center gap-1 ${isCurrent ? "opacity-100" : isComplete ? "opacity-100" : "opacity-30"}`}>
                              <div className={`h-3 w-3 rounded-full border-2 ${isComplete ? "border-[#2e7d32] bg-[#2e7d32]" : isCurrent ? "border-[#8c0504] bg-[#8c0504]" : "border-[#d8d2c5] bg-white"}`} />
                              <span className="whitespace-nowrap text-[10px] font-bold uppercase text-[#888]">{step}</span>
                            </div>
                            {idx < arr.length - 1 && (
                              <div className={`mx-1 mb-4 h-0.5 w-8 sm:w-12 ${isComplete && currentIdx > stepIdx ? "bg-[#2e7d32]" : "bg-[#d8d2c5]"}`} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {order.status === "cancelled" && (
                      <p className="mt-2 text-xs font-bold text-[#c62828]">This order was cancelled.</p>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
