"use client";

import { MapPin } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { HiUsers } from "react-icons/hi2";
import { TfiWorld } from "react-icons/tfi";
import PlayerList from "./PlayerList";
import PlayerRankings from "./PlayerRankings";

type RankingTab = "national" | "area" | "court";

const tabs: Array<{
  key: RankingTab;
  label: string;
  icon: React.ReactNode;
}> = [
  {
    key: "national",
    label: "National",
    icon: <TfiWorld size={20} />,
  },
  { key: "area", label: "Area", icon: <HiUsers size={20} /> },
  { key: "court", label: "Court", icon: <MapPin size={20} /> },
];

export default function Rankings() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const param = searchParams.get("tab");
  const initialTab: RankingTab =
    param === "area" || param === "court" || param === "national"
      ? (param as RankingTab)
      : "national";

  const [activeTab, setActiveTab] = useState<RankingTab>(initialTab);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (
      tabParam === "area" ||
      tabParam === "court" ||
      tabParam === "national"
    ) {
      setActiveTab(tabParam as RankingTab);
    }
  }, [searchParams]);

  return (
    <div>
      <div className="mb-5 py-6">
        <h1 className="text-2xl font-semibold  leading-none text-title">
          Rankings
        </h1>
        <p className="mt-2 text-base text-description">2 players</p>
      </div>
      <div className="min-h-screen  text-title mt-12">
        <div className="mx-auto w-full ">
          <div className="grid grid-cols-3 overflow-hidden rounded-lg p-1 text-base text-description">
            {tabs.map((tab) => {
              const active = tab.key === activeTab;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.key);
                    router.replace(`${pathname}?tab=${tab.key}`);
                  }}
                  className={`flex items-center justify-center gap-2  py-2.5 font-medium transition-colors ${
                    active
                      ? "bg-primary text-black rounded-lg"
                      : "bg-[#232323] text-[#d8d8d8] hover:bg-white/5"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 min-h-[560px] rounded-[4px]">
            {activeTab === "national" ? (
              <PlayerRankings />
            ) : activeTab === "area" ? (
              <PlayerList />
            ) : (
              <div className="pt-5">
                <div className="px-8 ">
                  <input
                    type="text"
                    placeholder="Search players..."
                    className="w-full rounded-lg bg-[#242424] text-description placeholder:text-description/50 border border-white/15 px-3 py-2 outline-none focus:border-primary focus:ring-0 "
                  />
                </div>
                <div className="mt-4">
                  <PlayerRankings />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
