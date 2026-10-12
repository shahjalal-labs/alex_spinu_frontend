import { CalendarDays, ClipboardList, Trophy, Users } from "lucide-react";

const stats = [
  {
    label: "Active Jobs",
    value: "12",
    icon: ClipboardList,
  },
  {
    label: "Upcoming Matches",
    value: "8",
    icon: CalendarDays,
  },
  {
    label: "Registered Players",
    value: "248",
    icon: Users,
  },
  {
    label: "Completed Events",
    value: "34",
    icon: Trophy,
  },
];

export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#111723] px-4 py-4"
          >
            <div>
              <p className="text-sm text-description">{stat.label}</p>
              <p className="mt-1 text-2xl font-semibold text-title">
                {stat.value}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-6 w-6" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
