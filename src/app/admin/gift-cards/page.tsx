"use client";

import { useEffect, useState } from "react";
import { message as antMessage } from "antd";
import { AdminChrome, AdminPanel } from "@/components/admin/AdminChrome";
import { api, isApiSuccess } from "@/lib/api/client";

type GiftCard = {
  id: string;
  code: string;
  initialAmountCents: number;
  remainingAmountCents: number;
  recipientEmail: string | null;
  purchaserEmail: string | null;
  status: string;
  createdAt: string;
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-[#eef8e8] text-[#24551f]",
  redeemed: "bg-[#eaf3ff] text-[#175cd3]",
  disabled: "bg-[#ffe8e6] text-[#8c0504]",
};

export default function AdminGiftCardsPage() {
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [amountCents, setAmountCents] = useState(2500);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [purchaserEmail, setPurchaserEmail] = useState("");
  const [creating, setCreating] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/api/admin/gift-cards");
      if (isApiSuccess(res.status)) setGiftCards(res.data.data.giftCards);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.post("/api/admin/gift-cards", {
        amountCents: Number(amountCents),
        recipientEmail: recipientEmail.trim() || undefined,
        purchaserEmail: purchaserEmail.trim() || undefined,
      });
      if (isApiSuccess(res.status)) {
        const code = res.data.data.giftCard.code as string;
        antMessage.success(`Gift card created: ${code}`);
        setRecipientEmail("");
        setPurchaserEmail("");
        void load();
      } else {
        antMessage.error(res.data?.error?.message ?? "Creation failed.");
      }
    } finally {
      setCreating(false);
    }
  }

  const filtered = filterStatus
    ? giftCards.filter((g) => g.status === filterStatus)
    : giftCards;

  return (
    <AdminChrome title="Gift Cards" eyebrow="Admin / Gift Cards">
      <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
        <AdminPanel title="Generate Gift Card">
          <form onSubmit={handleCreate} className="grid gap-4">
            <p className="text-sm text-[#667085]">
              Generate a gift card for promotions, giveaways, or manual issuance. Cards can be redeemed at subscription checkout or in the store.
            </p>
            <label className="grid gap-1 text-xs font-black uppercase text-[#8c0504]">
              Amount (cents)
              <input
                type="number"
                min={100}
                step={100}
                value={amountCents}
                onChange={(e) => setAmountCents(Number(e.target.value))}
                required
                className="rounded-md border border-[#d9dde3] px-3 py-2.5 text-sm font-normal text-[#202020] outline-none focus:border-[#8c0504]"
              />
              <span className="text-[11px] font-normal normal-case text-[#667085]">
                = ${(amountCents / 100).toFixed(2)} gift card
              </span>
            </label>
            <label className="grid gap-1 text-xs font-black uppercase text-[#8c0504]">
              Recipient email <span className="font-normal normal-case">(optional)</span>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="user@example.com"
                className="rounded-md border border-[#d9dde3] px-3 py-2.5 text-sm font-normal normal-case text-[#202020] outline-none focus:border-[#8c0504]"
              />
            </label>
            <label className="grid gap-1 text-xs font-black uppercase text-[#8c0504]">
              Issuer / purchaser email <span className="font-normal normal-case">(optional)</span>
              <input
                type="email"
                value={purchaserEmail}
                onChange={(e) => setPurchaserEmail(e.target.value)}
                placeholder="admin@example.com"
                className="rounded-md border border-[#d9dde3] px-3 py-2.5 text-sm font-normal normal-case text-[#202020] outline-none focus:border-[#8c0504]"
              />
            </label>
            <button
              type="submit"
              disabled={creating || amountCents < 100}
              className="w-fit rounded-md border-2 border-[#212121] bg-[#faff8d] px-5 py-2.5 text-sm font-black text-[#212121] shadow-[0_3px_0_#111] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? "Generating…" : "Generate Gift Card"}
            </button>
          </form>
        </AdminPanel>

        <AdminPanel title={`Gift Cards (${filtered.length})`}>
          <div className="mb-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-md border border-[#d9dde3] bg-white px-3 py-2 text-sm font-bold text-[#202020]"
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="redeemed">Redeemed</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
          {loading ? (
            <p className="text-sm text-[#667085]">Loading…</p>
          ) : !filtered.length ? (
            <p className="text-sm text-[#667085]">No gift cards found.</p>
          ) : (
            <div className="overflow-hidden rounded-md border border-[#edf0f3]">
              {filtered.map((gc) => (
                <div
                  key={gc.id}
                  className="grid gap-2 border-b border-[#edf0f3] px-4 py-3 last:border-b-0 sm:grid-cols-[auto_1fr_100px_120px]"
                >
                  <code className="self-center rounded bg-[#f4f4f4] px-2 py-1 text-xs font-black tracking-widest text-[#202020]">
                    {gc.code}
                  </code>
                  <div className="min-w-0 self-center">
                    <p className="text-xs text-[#667085]">
                      {gc.recipientEmail ? `→ ${gc.recipientEmail}` : "No recipient"}
                      {gc.purchaserEmail ? ` / from ${gc.purchaserEmail}` : ""}
                    </p>
                    <p className="text-xs text-[#667085]">
                      {new Date(gc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="self-center text-sm font-bold text-[#202020]">
                    ${(gc.remainingAmountCents / 100).toFixed(2)}
                    <span className="ml-1 text-xs font-normal text-[#667085]">
                      / ${(gc.initialAmountCents / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="self-center">
                    <span className={`rounded-sm px-2 py-1 text-xs font-black uppercase ${STATUS_COLORS[gc.status] ?? "bg-[#f4f4f4] text-[#667085]"}`}>
                      {gc.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </AdminPanel>
      </div>
    </AdminChrome>
  );
}
