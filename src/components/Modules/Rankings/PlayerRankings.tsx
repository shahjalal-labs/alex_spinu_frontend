import ball from "@/assets/dashboard/ball-orange.png";
import Image from "next/image";
import { PiCrownSimpleFill } from "react-icons/pi";

type Player = {
  rank: number;
  name: string;
  points: number;
  initials: string;
  avatarTone: string;
  ringTone: string;
  isChampion?: boolean;
};

const topThree: Player[] = [
  {
    rank: 2,
    name: "Morkel Jack",
    points: 40,
    initials: "MJ",
    avatarTone: "bg-[radial-gradient(circle_at_30%_30%,#8f8f8f,#272727)]",
    ringTone: "border-[#f59e0b] shadow-[0_0_30px_rgba(251,163,15,0.25)]",
  },
  {
    rank: 1,
    name: "Bryan Wolf",
    points: 43,
    initials: "BW",
    avatarTone: "bg-primary",
    ringTone: "border-[#D25A00] shadow-[0_0_30px_rgba(251,163,15,0.25)]",
    isChampion: true,
  },
  {
    rank: 3,
    name: "Elijah Jess",
    points: 40,
    initials: "EJ",
    avatarTone: "bg-[radial-gradient(circle_at_30%_30%,#9d5a24,#3e2411)]",
    ringTone: "border-[#f59e0b] shadow-[0_0_30px_rgba(251,163,15,0.25)]",
  },
];

const restOfPlayers: Player[] = [
  {
    rank: 4,
    name: "Marsha Fisher",
    points: 36,
    initials: "MF",
    avatarTone: "bg-[radial-gradient(circle_at_30%_30%,#6a3c2f,#241917)]",
    ringTone: "border-white/10",
  },
  {
    rank: 5,
    name: "Juanita Cormier",
    points: 35,
    initials: "JC",
    avatarTone: "bg-[radial-gradient(circle_at_30%_30%,#f48b82,#3c1d1b)]",
    ringTone: "border-white/10",
  },
  {
    rank: 6,
    name: "Devon Lane",
    points: 34,
    initials: "DL",
    avatarTone: "bg-[radial-gradient(circle_at_30%_30%,#7d5a3d,#291d15)]",
    ringTone: "border-white/10",
  },
  {
    rank: 7,
    name: "Tamara Schmidt",
    points: 33,
    initials: "TS",
    avatarTone: "bg-[radial-gradient(circle_at_30%_30%,#6b8eb5,#25303d)]",
    ringTone: "border-white/10",
  },
  {
    rank: 8,
    name: "Marcus Vance",
    points: 31,
    initials: "MV",
    avatarTone: "bg-[radial-gradient(circle_at_30%_30%,#5a8d6e,#1e3626)]",
    ringTone: "border-white/10",
  },
  {
    rank: 9,
    name: "Elena Rostova",
    points: 29,
    initials: "ER",
    avatarTone: "bg-[radial-gradient(circle_at_30%_30%,#8d5a86,#361e33)]",
    ringTone: "border-white/10",
  },
  {
    rank: 10,
    name: "Darius Cole",
    points: 27,
    initials: "DC",
    avatarTone: "bg-[radial-gradient(circle_at_30%_30%,#9e7b4a,#3d2c16)]",
    ringTone: "border-white/10",
  },
];

function Avatar({ player }: { player: Player }) {
  const unsplash = [
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=400&q=80",
  ];

  function avatarSrc(rank: number) {
    return unsplash[(rank - 1) % unsplash.length];
  }

  return (
    <div className="flex flex-col items-center text-center">
      <div
        className={`relative flex ${
          player.isChampion
            ? "h-20 w-20 sm:h-28 sm:w-28 md:h-32 md:w-32 border-[6px] border-[#D25A00] shadow-[0_0_0_6px_rgba(245,158,11,0.14)]"
            : "h-16 w-16 sm:h-24 sm:w-24 md:h-28 md:w-28 border-[4px] md:mt-16"
        } items-center justify-center rounded-full ${player.ringTone} ${player.avatarTone}`}
      >
        {player.isChampion ? (
          <div className="absolute -top-8 sm:-top-10 md:-top-13 flex h-8 sm:h-10 md:h-12 w-8 sm:w-10 md:w-12 items-center justify-center text-[#D25A00] ">
            <PiCrownSimpleFill className="h-8 sm:h-10 md:h-12 w-8 sm:w-10 md:w-12 fill-current stroke-[1.4]" />
          </div>
        ) : null}
        <Image
          src={avatarSrc(player.rank)}
          alt={player.name}
          width={82}
          height={82}
          className="h-[46px] w-[46px] sm:h-[66px] sm:w-[66px] md:h-[82px] md:w-[82px]  rounded-full object-cover ring-1 ring-white/10 "
        />

        <div
          className={`absolute -bottom-3 sm:-bottom-4 flex ${player.isChampion ? "h-8 w-8 sm:h-10 sm:w-10 bg-[#D25A00]" : "bg-primary h-6 w-6 sm:h-8 sm:w-8"} items-center justify-center rounded-full   text-base sm:text-lg font-bold text-white shadow-md ring-2 ring-[#f59e0b]/30`}
        >
          {player.rank}
        </div>
      </div>

      <p className="mt-7 text-base md:text-lg font-semibold text-title">
        {player.name}
      </p>
      <p className="mt-1 flex items-center gap-1.5 text-base text-title">
        <Image src={ball} alt="Points" width={20} height={20} className="" />
        {player.points} pts
      </p>
    </div>
  );
}

export default function PlayerRankings() {
  return (
    <div className="min-h-screen   text-title ">
      <div className="mx-auto flex w-full  flex-col rounded-[2px]  ">
        <div className="flex-1 pt-10">
          <div className="flex  items-end justify-center gap-4 md:gap-14 px-10 md:px-0">
            {topThree.map((player) => (
              <Avatar key={player.rank} player={player} />
            ))}
          </div>

          <div className="mt-8 space-y-2.5">
            {restOfPlayers.map((player, idx) => (
              <div
                key={`player-${player.rank}-${player.name}-${idx}`}
                className="flex items-center justify-between rounded-xl bg-[#252728] px-4 py-3.5 text-sm shadow-[0_2px_0_rgba(0,0,0,0.12)]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="w-5 shrink-0 text-center text-base text-description">
                    {player.rank}
                  </span>
                  <div
                    className={`h-8 w-8 shrink-0 overflow-hidden rounded-full ${player.avatarTone} ring-1 ring-white/10`}
                  >
                    <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-white/90">
                      {player.initials}
                    </div>
                  </div>
                  <span className="truncate font-semibold text-title">
                    {player.name}
                  </span>
                </div>

                <span className="shrink-0 text-base text-description">
                  {player.points} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
