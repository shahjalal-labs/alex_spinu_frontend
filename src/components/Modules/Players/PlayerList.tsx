import Image from "next/image";
import Link from "next/link";

type P = {
  rank: number;
  name: string;
  country: string;
  pts: number;
  avatar: string;
};

const players: P[] = [
  {
    rank: 33,
    name: "Vågner",
    country: "Brazil",
    pts: 120,
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
  },
  {
    rank: 3,
    name: "Raphael Rossi",
    country: "Brazil",
    pts: 110,
    avatar:
      "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=400&q=80",
  },
  {
    rank: 18,
    name: "Talocha",
    country: "Portugal",
    pts: 98,
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80",
  },
  {
    rank: 10,
    name: "Carraca",
    country: "Portugal",
    pts: 88,
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
  },
  {
    rank: 3,
    name: "Raphael Rossi",
    country: "Brazil",
    pts: 72,
    avatar:
      "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=400&q=80",
  },
];

export default function PlayerList() {
  return (
    <div className="space-y-3 mt-16">
      {players.map((p) => {
        function slugify(s: string) {
          return s
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .replace(/[^a-zA-Z0-9\s-]/g, "")
            .trim()
            .replace(/\s+/g, "-")
            .toLowerCase();
        }

        const slug = slugify(p.name);
        return (
          <Link
            href={`/player/${slug}`}
            key={`${p.rank}-${p.name}`}
            className="flex items-center justify-between gap-3 rounded-2xl border-[#928E8E45] border-2 bg-[#000000] px-4 py-8 shadow-[0_2px_0_rgba(0,0,0,0.12)] hover:opacity-95"
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center h-12 w-12 shrink-0 rounded-lg bg-[#0f0f0f]">
                <span className="text-4xl font-bold text-[#f59e0b]">
                  {String(p.rank).padStart(2, "0")}
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate font-semibold text-base text-title">
                    {p.name}
                  </span>
                </div>
                <div className="text-sm text-description">{p.country}</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-base text-description">{p.pts}</span>
              <div className="h-12 w-12 overflow-hidden rounded-lg bg-black/10">
                <Image
                  src={p.avatar}
                  alt={p.name}
                  width={48}
                  height={48}
                  className="object-cover"
                />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
