import { TokenActionForm } from "@/components/TokenActionForm";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <main className="min-h-screen bg-[#eee6d6] px-4 py-16 text-[#202020]">
      <section className="container max-w-[720px]">
        <p className="font-bebas text-sm uppercase text-[#b22222]">Password</p>
        <h1 className="font-bebas text-[clamp(3rem,7vw,5rem)] uppercase leading-[0.86]">
          Set New Password
        </h1>
        <div className="mt-6">
          <TokenActionForm endpoint="/api/auth/reset-password" mode="reset-password" token={token} />
        </div>
      </section>
    </main>
  );
}
