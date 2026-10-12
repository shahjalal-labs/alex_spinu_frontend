import Image from "next/image";
import Link from "next/link";

type PlayerData = {
  name: string;
  country: string;
  image: string;
  description: string;
};

type Props = {
  params: Promise<{ id: string }>;
};

const fakePlayers: Record<string, PlayerData> = {
  vagner: {
    name: "Vågner",
    country: "Brazil",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1400&q=80",
    description:
      "A basketball player is a dynamic athlete defined by agility, precision, and relentless energy. Standing tall or playing with explosive speed, they command the court with sharp instincts and quick decision-making. Their skill set blends powerful dribbling, accurate shooting, and strategic vision that elevates team play.",
  },
  "raphael-rossi": {
    name: "Raphael Rossi",
    country: "Brazil",
    image:
      "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1400&q=80",
    description:
      "An aggressive wing player with solid defensive instincts and a smooth shooting stroke. Strong on the perimeter and able to penetrate defenses.",
  },
};

export default async function Page({ params }: Props) {
  const { id } = await params;

  function normalizeId(s: string) {
    return s
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase();
  }

  const player = fakePlayers[id] ??
    fakePlayers[normalizeId(id)] ?? {
      name: id.replace(/-/g, " "),
      country: "Unknown",
      image:
        "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=1400&q=80",
      description: "Player information is not available.",
    };

  return (
    <div className="py-6 bg-[#14161b]">
      <div className="mb-4 flex items-center gap-4">
        <Link
          href="/rankings?tab=area"
          className="flex items-center gap-1 text-2xl text-description hover:text-primary"
        >
          ← Player Details
        </Link>
      </div>

      <div className="rounded-2xl border-2 border-[#3b2f20] overflow-hidden  bg-[#241e15] p-4">
        <div className="relative h-[340px] w-full">
          <Image
            src={player.image}
            alt={player.name}
            fill
            className="object-cover rounded-lg"
          />
        </div>

        <div className="px-6 py-6 text-title space-y-2">
          <h2 className="text-xl font-semibold">{player.name}</h2>
          <div className="text-base text-description mb-4">
            {player.country}
          </div>

          <h3 className="text-xl font-semibold mb-2">Player Description</h3>
          <p className="text-base text-description leading-relaxed">
            {player.description} <span className="text-primary">Read More</span>
          </p>

          <div className="mt-6 flex items-center justify-between text-xl text-description">
            <span>Country:</span>
            <span>{player.country}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
