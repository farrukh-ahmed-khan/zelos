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
        <div className="mx-auto max-w-[960px]">
          <p className="eyebrow-red mb-1">
            Forum
          </p>
          <h2 className="bg-[linear-gradient(198deg,#B22222_0%,#1D1D1D_25%)] bg-clip-text font-bebas text-[56px] font-bold uppercase leading-[50px] tracking-normal text-transparent [-webkit-background-clip:text] [-webkit-text-fill-color:transparent] sm:text-[90px] sm:leading-[76px]">
            Community Forum Preview
          </h2>

          <div className="row g-4 mt-8">
            {topics.map((topic) => (
              <div className="col-12 col-md-6 col-lg-4" key={topic.title}>
                <article className="h-full overflow-hidden rounded-lg border border-[#e8e8e8] bg-white shadow-[0_1px_1px_rgba(0,0,0,0.03)]">
                  <div className="relative h-[145px] overflow-hidden">
                    <Image
                      src={topic.image}
                      alt={topic.title}
                      fill
                      sizes="(min-width: 992px) 300px, (min-width: 768px) 48vw, 100vw"
                      className="object-cover"
                    />
                    <span className="absolute left-3 top-3 rounded-sm bg-[#b22222] px-3 py-1 font-bebas text-sm uppercase leading-none text-white">
                      {topic.tag}
                    </span>
                  </div>

                  <div className="px-4 py-4">
                    <p className="text-xs font-medium text-[#53627c]">{topic.time}</p>
                    <h3 className="mt-5 min-h-[52px] text-base font-black leading-tight text-[#111]">
                      {topic.title}
                    </h3>
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t border-[#e8e8e8] px-4 py-4">
                    <p className={`text-xs font-bold ${topic.statusColor}`}>
                      {topic.status}
                    </p>
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#59739a]">
                      <RetweetOutlined className="text-sm" />
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
