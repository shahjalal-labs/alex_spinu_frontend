import ai from "@/assets/dashboard/coaching/ai.png";
import analyze from "@/assets/dashboard/coaching/analyze.png";
import calendar from "@/assets/dashboard/coaching/calendar.png";
import strategy from "@/assets/dashboard/coaching/strategy.png";
import { Crown } from "lucide-react";
import Image from "next/image";
import { LiaCrownSolid } from "react-icons/lia";

const features = [
  {
    title: "AI Video Analysis",
    desc: "Upload clips and get instant AI-powered breakdowns",
    img: ai,
    bg: "bg-[#3b1f07]",
  },
  {
    title: "Custom Drill Plans",
    desc: "Personalized training based on your weaknesses",
    img: calendar,
    bg: "bg-[#40260b]",
  },
  {
    title: "Strategy Insights",
    desc: "Learn basketball IQ from AI recommendations",
    img: strategy,
    bg: "bg-[#0f3a2f]",
  },
  {
    title: "Unlimited Sessions",
    desc: "Analyze as many videos as you want",
    img: analyze,
    bg: "bg-[#15384a]",
  },
];

export default function Coaching() {
  return (
    <div className="my-6">
      <h1 className="text-2xl font-semibold text-white">Coaching</h1>
      <div className="flex min-h-screen w-full items-center justify-center md:px-4 py-8">
        <div className="w-full max-w-2xl rounded-2xl bg-[#120B07] border-primary/20 border p-4 md:p-8 text-white shadow-lg">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-14  items-center justify-center rounded-xl bg-[#2a1a0a] p-3 w-16">
              <Crown size={80} className="text-primary " />
            </div>

            <h2 className="text-2xl font-semibold">Unlock AI Coaching</h2>
            <p className="text-center text-base text-description max-w-[20rem]">
              Get personalized feedback and take your game to the next level
            </p>
          </div>

          <div className="mt-6 space-y-4">
            {features.map((f) => {
              return (
                <div key={f.title} className="flex items-start gap-4">
                  <div
                    className={`${f.bg} flex items-center justify-center rounded-lg overflow-hidden`}
                  >
                    <Image
                      src={f.img}
                      alt={f.title}
                      width={50}
                      height={50}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <p className="font-semibold">{f.title}</p>
                    <p className="text-base text-description max-w-[18rem]">
                      {f.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 text-center">
            <div className="text-3xl font-bold text-primary">$2.99</div>
            <div className="text-base text-description">per month</div>
          </div>

          <div className="mt-6">
            <button className="w-full rounded-xl bg-gradient-to-r from-[#FBA30F] to-[#D25A00] text-transparent hover:opacity-90 px-6 py-3 text-base  text-white font-semibold">
              <span className="flex items-center justify-center gap-2 ">
                <LiaCrownSolid size={20} />
                Upgrade to Premium
              </span>
            </button>
          </div>

          <p className="mt-3 text-center text-base text-description">
            Cancel anytime • 7 - day money-back guarantee
          </p>
        </div>
      </div>
    </div>
  );
}
