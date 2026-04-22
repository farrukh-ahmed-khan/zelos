import { Button, Card, Tag } from "antd";

const features = ["Next.js 16", "App Router", "Tailwind CSS 4", "Ant Design 6"];

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff_0%,_#eef4ff_45%,_#dbe7ff_100%)] px-6 py-12 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-5xl items-center justify-center">
        <Card className="w-full max-w-4xl border-0 shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
          <div className="flex w-full flex-col gap-8">
            <Tag color="blue" className="mr-auto rounded-full px-4 py-1 text-sm">
              Tailwind + Ant Design
            </Tag>

            <div className="space-y-4">
              <h1 className="text-5xl leading-tight font-semibold tracking-tight text-slate-900">
                Zelos is ready.
              </h1>
              <p className="max-w-2xl text-lg text-slate-600">
                This project was created with the Next.js App Router and includes
                Tailwind CSS plus Ant Design out of the box.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {features.map((feature) => (
                <Tag key={feature} className="rounded-full px-3 py-1 text-sm">
                  {feature}
                </Tag>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <Button type="primary" size="large">
                Start building
              </Button>
              <Button size="large" href="https://nextjs.org/docs" target="_blank">
                Next.js Docs
              </Button>
              <Button size="large" href="https://ant.design/components/overview" target="_blank">
                Ant Design Docs
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
