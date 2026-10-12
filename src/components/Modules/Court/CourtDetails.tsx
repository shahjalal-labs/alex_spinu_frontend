"use client";

import { useGetCourtByIdQuery } from "@/redux/api/courtsApi";
import {
  CalendarDays,
  Clapperboard,
  MapPin,
  Share2,
  Star,
  Trophy,
  X,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AiOutlineSun } from "react-icons/ai";
import { BsBoxArrowInRight } from "react-icons/bs";
import { LuGamepad2 } from "react-icons/lu";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { TfiLocationPin } from "react-icons/tfi";
import { toast } from "sonner";
import { CustomModal } from "../../modal/CustomModal";
import PlayerRankings from "../Rankings/PlayerRankings";
import { useCreateGameMutation } from "@/redux/api/gameApi";
import { useCheckinGameMutation } from "@/redux/api/checkinApi";
import { useGetHighlightsQuery } from "@/redux/api/highlightApi";
import AllHighlights from "../Highlight/AllHighlights";

const defaultHeroImage =
  "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1600&q=80";

const youtubeVideoId = "dQw4w9WgXcQ";
const youtubeEmbedUrl = `https://www.youtube.com/embed/${youtubeVideoId}`;

type SectionKey = "games" | "highlights" | "rankings";

const TAB_BUTTONS: Array<{
  key: SectionKey;
  label: string;
  icon: React.ReactNode;
}> = [
  { key: "games", label: "Games", icon: <LuGamepad2 className="h-4 w-4" /> },
  {
    key: "highlights",
    label: "Highlights",
    icon: <Clapperboard className="h-4 w-4" />,
  },
  { key: "rankings", label: "Rankings", icon: <Trophy className="h-4 w-4" /> },
];

// Map game type to API format - FIXED enum values
const mapGameTypeToApi = (type: string): string => {
  const typeMap: Record<string, string> = {
    "🏀 Pickup": "Pickup",
    "⚡3v3": "threeOnThree",
    "🔥 5v5": "fiveOnFive",
    "🎯 Shootaround": "ShootAround",
    "🏆 Tournament": "Tournament",
  };
  return typeMap[type] || "Pickup";
};

// Map skill level to API format
const mapSkillLevelToApi = (level: string): string => {
  const levelMap: Record<string, string> = {
    "All Levels Welcome": "AllLevels",
    "Beginner": "Beginner",
    "Intermediate": "Intermediate",
    "Advanced": "Advanced",
  };
  return levelMap[level] || "AllLevels";
};

// Map duration to minutes
const mapDurationToMinutes = (duration: string): number => {
  const durationMap: Record<string, number> = {
    "1 hour": 60,
    "1.5 hours": 90,
    "2 hours": 120,
    "3 hours": 180,
    "30 minutes": 30,
  };
  return durationMap[duration] || 60;
};

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

export default function CourtDetails() {
  const router = useRouter();
  const params = useParams();
  const id = (params?.id as string) || "";

  const { data, isLoading, isError, refetch } = useGetCourtByIdQuery(id, { skip: !id });
  const court = data?.result ?? data?.data;

  const { data: courtHighlightsData, isLoading: isHighlightsLoading } =
    useGetHighlightsQuery({ courtId: id }, { skip: !id });
  const courtHighlights = useMemo(() => {
    return (
      courtHighlightsData?.data?.highlights ||
      courtHighlightsData?.result?.highlights ||
      []
    );
  }, [courtHighlightsData]);

  const [activeTab, setActiveTab] = useState<SectionKey>("games");
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [duration, setDuration] = useState("1 hour");
  const [activity, setActivity] = useState("🏀 Playing");
  const [lookingForGame, setLookingForGame] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [gameTitle, setGameTitle] = useState("");
  const [gameType, setGameType] = useState("🏀 Pickup");
  const [gameDate, setGameDate] = useState("");
  const [gameTime, setGameTime] = useState("");
  const [gameDuration, setGameDuration] = useState("1 hour");
  const [maxPlayers, setMaxPlayers] = useState(10);
  const [skillLevel, setSkillLevel] = useState("All Levels Welcome");
  const [notes, setNotes] = useState("");

  const [createGameFn, { isLoading: isCreatingGame }] = useCreateGameMutation();
  const [checkinGameFn, { isLoading: isCheckingIn }] = useCheckinGameMutation();

  const courtName = court?.name || "Basketball Court";
  const courtAddress = court?.address || "Address unavailable";
  const courtRating =
    typeof court?.avgRating === "number" && court.avgRating > 0
      ? court.avgRating.toFixed(1)
      : "0.0";

  // Wrap courtPhotos in useMemo to avoid dependency issues
  const courtPhotos = useMemo(() => {
    return court?.photos && court.photos.length > 0 ? court.photos : [];
  }, [court]);

  const courtImage = courtPhotos.length > 0 ? courtPhotos[0] : defaultHeroImage;

  const courtBadges = useMemo(() => {
    const badges: Array<{ label: string; icon: React.ReactNode | null }> = [];
    badges.push({
      label: court?.courtType || "Outdoor",
      icon: <AiOutlineSun className="h-4 w-4" />,
    });
    if (court?.numberOfHoops !== null && court?.numberOfHoops !== undefined) {
      badges.push({ label: `${court.numberOfHoops} Hoops`, icon: null });
    }
    if (court?.surface) {
      badges.push({ label: `Surface: ${court.surface}`, icon: null });
    }
    if (court?.hasNightLight !== undefined && court?.hasNightLight !== null) {
      badges.push({
        label: court.hasNightLight ? "Night Lights" : "No Night Lights",
        icon: null,
      });
    }
    if (court?.admissionFee === 0) {
      badges.push({ label: "Free", icon: null });
    } else if (court?.admissionFee && court.admissionFee > 0) {
      badges.push({ label: `$${court.admissionFee}`, icon: null });
    }
    return badges;
  }, [court]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      toast.success("Court link copied to clipboard!");
    }
  };

  // Handle Check In - FIXED activity mapping
  const handleCheckIn = async () => {
    if (!court?.id) {
      toast.error("Court information is missing");
      return;
    }

    // Map duration to minutes
    const durationMins = mapDurationToMinutes(duration);

    // Map activity to API format - FIXED enum values
    const activityMap: Record<string, string> = {
      "🏀 Playing": "Playing",
      "⏰ Watching for game": "Watching",
    };
    const activityValue = activityMap[activity] || "Playing";

    // Prepare request body
    const requestBody = {
      courtId: court.id,
      durationMins: durationMins,
      activity: activityValue,
      lookingForGame: lookingForGame,
    };

    try {
      await checkinGameFn(requestBody).unwrap();
      toast.success(`Checked in to ${courtName}!`);
      setCheckInOpen(false);
      // Reset form
      setDuration("1 hour");
      setActivity("🏀 Playing");
      setLookingForGame(false);
      // Refetch court data to update check-in count
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to check in");
    }
  };

  // Handle Schedule Game
  const handleScheduleGame = async () => {
    // Validate required fields
    if (!gameDate) {
      toast.error("Please select a date");
      return;
    }
    if (!gameTime) {
      toast.error("Please select a time");
      return;
    }
    if (!court?.id) {
      toast.error("Court information is missing");
      return;
    }

    // Combine date and time into ISO string
    const dateTimeString = `${gameDate}T${gameTime}:00`;
    const startTime = new Date(dateTimeString).toISOString();

    // Map game type and skill level to API format
    const apiGameType = mapGameTypeToApi(gameType);
    const apiSkillLevel = mapSkillLevelToApi(skillLevel);
    const durationMins = mapDurationToMinutes(gameDuration);

    // Prepare request body
    const requestBody = {
      title: gameTitle.trim() || `${courtName} Game`,
      courtId: court.id,
      gameType: apiGameType,
      startTime: startTime,
      durationMins: durationMins,
      maxPlayers: maxPlayers,
      skillLevel: apiSkillLevel,
      notes: notes.trim() || undefined,
    };

    try {
      await createGameFn(requestBody).unwrap();
      toast.success("Game scheduled successfully!");
      setScheduleOpen(false);
      // Reset form
      setGameTitle("");
      setGameType("🏀 Pickup");
      setGameDate("");
      setGameTime("");
      setGameDuration("1 hour");
      setMaxPlayers(10);
      setSkillLevel("All Levels Welcome");
      setNotes("");
      // Refetch court data to update games list
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to schedule game");
    }
  };

  const activeContent = useMemo(() => {
    switch (activeTab) {
      case "highlights":
        return (
          <div className="mt-10 space-y-8">
            {courtHighlights.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4 text-white">Court Highlights</h3>
                <AllHighlights
                  highlights={courtHighlights}
                  isLoading={isHighlightsLoading}
                />
              </div>
            )}

            {courtPhotos.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4 text-white">Court Photos</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {courtPhotos.map((photo, index) => (
                    <article
                      key={index}
                      className="overflow-hidden rounded-xl border border-white/10 relative aspect-[16/11] group bg-[#1b1b1b]"
                    >
                      <Image
                        src={photo}
                        alt={`${courtName} photo ${index + 1}`}
                        fill
                        className="object-cover object-center w-full h-full transition-transform duration-300 group-hover:scale-105"
                        unoptimized
                      />
                    </article>
                  ))}
                </div>
              </div>
            )}

            {courtHighlights.length === 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4 text-white">Featured Highlight</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <article className="overflow-hidden rounded-xl border border-white/10 bg-[#1b1b1b]">
                    <div className="relative aspect-[16/9] w-full bg-black">
                      <iframe
                        src={youtubeEmbedUrl}
                        title="YouTube highlight video"
                        className="absolute inset-0 h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                      <div className="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-black/65 via-black/10 to-transparent p-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                            video
                          </p>
                          <h3 className="mt-1 text-lg font-semibold text-white">
                            Game highlight reel
                          </h3>
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              </div>
            )}
          </div>
        );
      case "rankings":
        return (
          <div>
            <PlayerRankings />
          </div>
        );
      case "games":
      default:
        const gamesList = court?.games || [];
        if (gamesList.length > 0) {
          return (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {gamesList.map((game: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-white/10 bg-[#202020] space-y-2 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold text-lg text-white">
                      {game.title || "Scheduled Game"}
                    </h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      game.status === "Scheduled" 
                        ? "bg-emerald-500/20 text-emerald-400" 
                        : game.status === "Completed"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}>
                      {game.status || "Scheduled"}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-description">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatGameDate(game.startTime)}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span>{getGameTypeDisplay(game.gameType)}</span>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span>👥 {game.maxPlayers} players</span>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span className="capitalize">{game.skillLevel}</span>
                  </div>
                  {game.notes && (
                    <p className="text-xs text-description/70 mt-1 italic">
                      📝 {game.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          );
        }
        return (
          <div className="mt-12 flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2f2411] text-primary">
              <CalendarDays className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-semibold text-title">
              No scheduled games
            </h3>
            <p className="mt-2 max-w-sm text-sm text-description">
              Be the first to schedule a game at this court
            </p>
            <button
              onClick={() => setScheduleOpen(true)}
              className="mt-8 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-black transition-colors hover:bg-primary/90"
            >
              Schedule Game
            </button>
          </div>
        );
    }
  }, [activeTab, courtPhotos, courtName, court?.games]);

  if (isLoading) {
    return (
      <div className="min-h-screen text-title p-4 animate-pulse space-y-6">
        <div className="h-72 md:h-96 w-full bg-white/5 rounded-2xl" />
        <div className="h-40 w-full bg-white/5 rounded-2xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6">
        <h2 className="text-2xl font-bold text-red-400">Court not found</h2>
        <p className="mt-2 text-description">
          The requested court could not be loaded.
        </p>
        <button
          onClick={() => router.back()}
          className="mt-4 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-black"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-title">
      <div className="mx-auto w-full">
        <div className="overflow-hidden">
          <div className="relative h-[300px] md:h-[420px] w-full bg-[#171717]">
            <Image
              src={courtImage}
              alt={courtName}
              fill
              priority
              className="object-cover object-center w-full"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-black/20 to-black/30" />

            <div className="absolute left-4 top-4 flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                aria-label="Back"
              >
                <MdKeyboardArrowLeft size={20} />
              </button>
            </div>
            <div className="absolute right-4 top-4 flex items-center gap-3">
              <button
                onClick={handleShare}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                aria-label="Share"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="px-4 pb-6 md:px-6 relative -top-14">
            <div className="rounded-2xl bg-[#202020] p-4 shadow-[0_10px_25px_rgba(0,0,0,0.25)] md:p-5">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-semibold md:text-[28px]">
                    {courtName}
                  </h1>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-description">
                    <MapPin className="h-3.5 w-3.5" />
                    {courtAddress}
                  </p>
                </div>

                <div className="inline-flex items-center gap-1 rounded-md bg-[#3a3220] px-3 py-1.5 text-sm text-primary">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  {courtRating}
                </div>
              </div>

              <div className="mb-4 flex flex-wrap items-center gap-2.5 w-full">
                {courtBadges.map((item) => (
                  <div
                    key={item.label}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#FFF7E81A] px-4 py-2 text-sm text-[#d4d4d4] border border-white/5"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                ))}
                {court?.status && (
                  <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 text-sm text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{court.status}</span>
                  </div>
                )}
              </div>

              <div className="mb-5 flex flex-wrap items-center gap-2.5 text-sm">
                <span className="font-semibold text-title">Amenities:</span>
                {Array.isArray(court?.amenities) && court.amenities.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-2">
                    {court.amenities.map((amenity: string, idx: number) => (
                      <span
                        key={idx}
                        className="inline-flex items-center rounded-md bg-white/5 border border-white/10 px-3 py-1 text-xs font-medium text-description"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-description">
                    Standard amenities available
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <button
                  onClick={() => setCheckInOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FBA30F] to-[#D25A00] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-95"
                >
                  <BsBoxArrowInRight size={16} />
                  Check In
                </button>
                <button
                  onClick={() => setScheduleOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#383A42] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#383A42]/90"
                >
                  <CalendarDays className="h-4 w-4" />
                  Schedule Game
                </button>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-primary/20 bg-[#121212] p-1">
              <div className="grid grid-cols-3 gap-1">
                {TAB_BUTTONS.map((tab) => {
                  const active = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm transition-colors ${
                        active
                          ? "bg-primary text-black"
                          : "text-description hover:text-title"
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {activeContent}

            {/* check in modal */}
            <CustomModal
              open={checkInOpen}
              onClose={() => setCheckInOpen(false)}
              title={undefined}
              maxWidth="2xl"
              showCloseButton={false}
            >
              <div className="relative space-y-5 rounded-2xl bg-[#242424] p-1 text-base text-white">
                <button
                  type="button"
                  onClick={() => setCheckInOpen(false)}
                  className="absolute right-0 top-0 flex h-9 w-9 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                  aria-label="Close check in modal"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="px-2 pt-2 text-center">
                  <h2 className="text-3xl font-semibold text-title">
                    Check In to {courtName}
                  </h2>
                </div>

                <div className="space-y-4 px-2 pb-2">
                  <div>
                    <label className="mb-2 block text-lg text-title">
                      How long are you playing?
                    </label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full rounded-lg border border-white/20 bg-[#242424] px-4 py-3 text-base text-description outline-none ring-0 placeholder:text-white/35 focus:border-primary"
                    >
                      <option className="bg-[#242424] text-white">30 minutes</option>
                      <option className="bg-[#242424] text-white">1 hour</option>
                      <option className="bg-[#242424] text-white">1.5 hours</option>
                      <option className="bg-[#242424] text-white">2 hours</option>
                      <option className="bg-[#242424] text-white">3 hours</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-lg text-title">
                      What are you doing?
                    </label>
                    <select
                      value={activity}
                      onChange={(e) => setActivity(e.target.value)}
                      className="w-full rounded-lg border border-white/20 bg-[#242424] px-4 py-3 text-base text-description outline-none ring-0 focus:border-primary"
                    >
                      <option className="bg-[#242424] text-white">🏀 Playing</option>
                      <option className="bg-[#242424] text-white">⏰ Watching for game</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-white/20 bg-[#242424] px-4 py-3">
                    <span className="text-base text-description">
                      Looking for a game?
                    </span>
                    <button
                      type="button"
                      onClick={() => setLookingForGame((current) => !current)}
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        lookingForGame ? "bg-primary" : "bg-white/10"
                      }`}
                      aria-pressed={lookingForGame}
                      aria-label="Toggle looking for a game"
                    >
                      <span
                        className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                          lookingForGame ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleCheckIn}
                      disabled={isCheckingIn}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-base font-semibold text-black hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isCheckingIn ? (
                        <>
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                          <span>Checking In...</span>
                        </>
                      ) : (
                        <>
                          <BsBoxArrowInRight size={20} />
                          <span>Check In</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </CustomModal>

            {/* schedule modal */}
            <CustomModal
              open={scheduleOpen}
              onClose={() => setScheduleOpen(false)}
              title={undefined}
              maxWidth="2xl"
              showCloseButton={false}
            >
              <div className="relative rounded-2xl bg-[#242424] p-1 text-sm text-white">
                <button
                  type="button"
                  onClick={() => setScheduleOpen(false)}
                  className="absolute right-0 top-0 flex h-9 w-9 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                  aria-label="Close schedule modal"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="px-2 pt-2 text-center">
                  <h2 className="text-3xl font-semibold text-title">
                    Schedule a Game
                  </h2>
                  <p className="mt-1 text-lg text-description">{courtName}</p>
                </div>

                <div className="space-y-4 px-2 pb-2 pt-4">
                  <div>
                    <label className="mb-2 block text-lg text-title">
                      Game Title (optional)
                    </label>
                    <input
                      value={gameTitle}
                      onChange={(e) => setGameTitle(e.target.value)}
                      placeholder="e.g., Sunday Runs"
                      className="w-full rounded-lg border border-white/20 bg-[#242424] px-4 py-3 text-base text-white outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-lg text-title">
                      Game Type
                    </label>
                    <select
                      value={gameType}
                      onChange={(e) => setGameType(e.target.value)}
                      className="w-full rounded-lg border border-white/20 bg-[#242424] px-4 py-3 text-base text-description outline-none focus:border-primary"
                    >
                      <option className="bg-[#242424] text-white">🏀 Pickup</option>
                      <option className="bg-[#242424] text-white">⚡3v3</option>
                      <option className="bg-[#242424] text-white">🔥 5v5</option>
                      <option className="bg-[#242424] text-white">🎯 Shootaround</option>
                      <option className="bg-[#242424] text-white">🏆 Tournament</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-2 block text-lg text-title">
                        Date
                      </label>
                      <input
                        type="date"
                        value={gameDate}
                        onChange={(e) => setGameDate(e.target.value)}
                        className="w-full rounded-lg border border-white/20 bg-[#242424] px-4 py-3 text-base text-description outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-lg text-title">
                        Time
                      </label>
                      <input
                        type="time"
                        value={gameTime}
                        onChange={(e) => setGameTime(e.target.value)}
                        className="w-full rounded-lg border border-white/20 bg-[#242424] px-4 py-3 text-base text-description outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-2 block text-lg text-title">
                        Duration
                      </label>
                      <select
                        value={gameDuration}
                        onChange={(e) => setGameDuration(e.target.value)}
                        className="w-full rounded-lg border border-white/20 bg-[#242424] px-4 py-3 text-base text-description outline-none focus:border-primary"
                      >
                        <option className="bg-[#242424] text-white">1 hour</option>
                        <option className="bg-[#242424] text-white">1.5 hours</option>
                        <option className="bg-[#242424] text-white">2 hours</option>
                        <option className="bg-[#242424] text-white">3 hours</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-lg text-title">
                        Max Players
                      </label>
                      <input
                        type="number"
                        value={maxPlayers}
                        onChange={(e) => setMaxPlayers(Number(e.target.value))}
                        className="w-full rounded-lg border border-white/20 bg-[#242424] px-4 py-3 text-base text-description outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-lg text-title">
                      Skill Level
                    </label>
                    <select
                      value={skillLevel}
                      onChange={(e) => setSkillLevel(e.target.value)}
                      className="w-full rounded-lg border border-white/20 bg-[#242424] px-4 py-3 text-base text-description outline-none focus:border-primary"
                    >
                      <option className="bg-[#242424] text-white">All Levels Welcome</option>
                      <option className="bg-[#242424] text-white">Beginner</option>
                      <option className="bg-[#242424] text-white">Intermediate</option>
                      <option className="bg-[#242424] text-white">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-lg text-title">
                      Additional Info
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                      className="w-full rounded-lg border border-white/20 bg-[#242424] px-4 py-3 text-base text-description outline-none focus:border-primary"
                      placeholder="Any additional info..."
                    />
                  </div>

                  <div>
                    <button
                      onClick={handleScheduleGame}
                      disabled={isCreatingGame}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-base font-semibold text-black hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isCreatingGame ? (
                        <>
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                          <span>Scheduling...</span>
                        </>
                      ) : (
                        <>
                          <TfiLocationPin />
                          <span>Schedule Game</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </CustomModal>
          </div>
        </div>
      </div>
    </div>
  );
}