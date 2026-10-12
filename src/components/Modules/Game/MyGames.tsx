"use client";

import { CalendarDays, MapPin, UserRoundPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/Pagination";
import { format } from "date-fns";

// Format date for display
const formatGameDate = (dateString: string): string => {
  if (!dateString) return "Upcoming";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date);
};

// Get game type display name
const getGameTypeDisplay = (type: string): string => {
  const typeMap: Record<string, string> = {
    "Pickup": "🏀 Pickup",
    "threeOnThree": "⚡3v3",
    "fiveOnFive": "🔥 5v5",
    "ShootAround": "🎯 Shootaround",
    "Tournament": "🏆 Tournament",
  };
  return typeMap[type] || type;
};

// Get status color
const getStatusColor = (status: string): string => {
  const statusMap: Record<string, string> = {
    "Scheduled": "bg-emerald-500/20 text-emerald-400",
    "Completed": "bg-blue-500/20 text-blue-400",
    "Cancelled": "bg-red-500/20 text-red-400",
  };
  return statusMap[status] || "bg-yellow-500/20 text-yellow-400";
};

interface MyGamesProps {
  gamesData: any;
  isLoading: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
  onRefetch: () => void;
  selectedDate: Date;
}

export default function MyGames({
  gamesData,
  isLoading,
  currentPage,
  onPageChange,
  onRefetch,
  selectedDate,
}: MyGamesProps) {
  const router = useRouter();

  const games = gamesData?.result?.games || [];
  const total = gamesData?.result?.total || 0;
  const totalPages = Math.ceil(total / 10);

  const isEmpty = games.length === 0 && !isLoading;

  const handleGameClick = (gameId: string) => {
    router.push(`/my-games/${gameId}`);
  };

  if (isLoading) {
    return (
      <div className="w-full mt-20">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-[#FBA30F33] bg-[#FBA30F1A] px-4 py-3 animate-pulse"
            >
              <div className="h-6 w-3/4 bg-white/10 rounded mb-2" />
              <div className="h-4 w-1/2 bg-white/10 rounded" />
              <div className="mt-4 h-4 w-2/3 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="w-full mt-20">
        <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2f2411] text-primary">
            <CalendarDays className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-semibold">No games scheduled</h3>
          <p className="mt-2 max-w-xs text-base text-description">
            You haven&apos;t created any games for {format(selectedDate, "MMMM d, yyyy")}. Create your first game!
          </p>
          <button className="mt-7 rounded-xl bg-primary px-6 py-3 text-base font-medium text-black transition-opacity hover:opacity-90">
            Create Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mt-20">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {games.map((game: any) => (
          <article
            key={game.id}
            onClick={() => handleGameClick(game.id)}
            className="rounded-2xl border border-[#FBA30F33] bg-[#FBA30F1A] px-4 py-3 cursor-pointer transition-all hover:border-[#FBA30F] hover:bg-[#FBA30F2A]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-normal leading-tight text-title">
                    {game.title || "Scheduled Game"}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(game.status)}`}>
                    {game.status || "Scheduled"}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-description">
                  <span>{getGameTypeDisplay(game.gameType)}</span>
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <span>{formatGameDate(game.startTime)}</span>
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <span>👥 {game.maxPlayers} players</span>
                </div>
                <p className="mt-1 text-sm text-description/70">
                  🏟️ {game.court?.name || "Unknown Court"}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1 text-base">
                <UserRoundPlus className="h-5 w-5 text-title" />
                <span className="text-sm text-description">
                  {game.participants?.length || 0}
                </span>
              </div>
            </div>

            <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-description">
              <MapPin className="h-4 w-4" />
              {game.court?.address || "Address unavailable"}
            </p>
          </article>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex justify-end">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      isActive={currentPage === pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}