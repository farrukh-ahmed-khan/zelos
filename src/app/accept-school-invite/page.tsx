import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { SchoolInviteAcceptForm } from "@/components/school/SchoolInviteAcceptForm";

export default async function AcceptSchoolInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const token = (await searchParams).token;

  if (!token) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-[#f4f5f7] p-4 text-[#202020] sm:p-6">
      <Header />
      <section className="mx-auto mt-12 max-w-[680px]">
        <p className="text-xs font-black uppercase tracking-wide text-[#8c0504]">School Invite</p>
        <h1 className="mt-2 text-3xl font-black">Create your school account</h1>
        <div className="mt-6">
          <SchoolInviteAcceptForm token={token} />
        </div>
      </section>
    </main>
  );
}
