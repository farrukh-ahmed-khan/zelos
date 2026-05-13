import { RetweetOutlined } from "@ant-design/icons";
import Image from "next/image";

const topics = [
  {
    tag: "Finance for Teens",
    image: "/assets/fifteen-year-old.png",
    time: "2 hours ago",
    title: "How do I explain credit scores to my 15-year old?",
    status: "Mentor Replied",
    statusColor: "text-[#5b88ff]",
  },
  {
    tag: "Finance for Teens",
    image: "/assets/first-paycheck.png",
    time: "2 weeks ago",
    title: "First paycheck - what percentage should go to savings?",
    status: "Mentor Replied",
    statusColor: "text-[#5b88ff]",
  },
  {
    tag: "Finance for Young Adults",
    image: "/assets/emergency.png",
    time: "2 hours ago",
    title: "Best way to start an emergency fund from $0",
    status: "Active",
    statusColor: "text-[#14bd47]",
  },
];

export function CommunityForumPreview() {
  return (
    <section className="bg-white px-4 py-16 text-[#111] sm:px-6 lg:py-20">
      <div className="container">
        <div className="mx-auto max-w-[1420px]">
          <p className="eyebrow-red mb-1">
            Forum
          </p>
          <h2 className="home-section-heading mb-[38px] bg-[linear-gradient(198deg,#B22222_0%,#1D1D1D_25%)] bg-clip-text text-transparent [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
            Community Forum Preview
          </h2>

          <div className="row g-4">
            {topics.map((topic) => (
              <div className="col-12 col-md-6 col-lg-4" key={topic.title}>
                <article className="flex h-full flex-col overflow-hidden rounded-lg border border-[#e8e8e8] bg-white shadow-[0_1px_1px_rgba(0,0,0,0.03)]">
                  <div className="relative h-[271.118px] w-full overflow-hidden lg:max-w-[453.139px]">
                    <Image
                      src={topic.image}
                      alt={topic.title}
                      fill
                      sizes="(min-width: 992px) 453px, (min-width: 768px) 48vw, 100vw"
                      className="object-cover"
                    />
                    <span className="absolute left-3 top-3 rounded-sm bg-[#b22222] px-3 py-1 font-dm text-[15.901px] font-bold uppercase leading-[15.901px] tracking-[0.795px] text-white">
                      {topic.tag}
                    </span>
                  </div>

                  <div className="flex min-h-[196px] flex-col px-4 py-4">
                    <p className="font-dm text-[17.226px] font-medium leading-[39.751px] text-[#6777A1]">{topic.time}</p>
                    <h3 className="mt-5 font-sans text-[24px] font-semibold leading-[30px] text-black underline decoration-transparent">
                      {topic.title}
                    </h3>
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t border-[#e8e8e8] px-4 py-4">
                    <p className={`font-dm text-[18.551px] font-bold leading-[39.751px] ${topic.statusColor}`}>
                      {topic.status}
                    </p>
                    <div className="flex items-center gap-2 font-sans text-[17.226px] font-medium leading-[39.751px] text-[#6777A1]">
                      <RetweetOutlined className="text-[17.226px]" />
                      24
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
