"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BsBoxArrowInRight } from "react-icons/bs";
import { FiArrowLeft } from "react-icons/fi";
import { CustomModal } from "../../modal/CustomModal";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useGetGameDetailsQuery } from "@/redux/api/gameApi";
import { useCheckinGameMutation } from "@/redux/api/checkinApi";
import type { RootState } from "@/redux/store";
import Cookies from "js-cookie";
import { useSelector } from "react-redux";
import { toast } from "sonner";

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

// Format date for display (short version)
const formatGameDateShort = (dateString: string): string => {
  if (!dateString) return "Upcoming";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  }).format(date);
};

// Format time for display
const formatGameTime = (dateString: string): string => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date);
};

// Get game type display name
const getGameTypeDisplay = (type: string): string => {
  const typeMap: Record<string, string> = {
    "Pickup": "🏀 Pickup",
    "threeOnThree": "⚡ 3v3",
    "fiveOnFive": "🔥 5v5",
    "ShootAround": "🎯 Shootaround",
    "Tournament": "🏆 Tournament",
  };
  return typeMap[type] || type;
};

// Get skill level display
const getSkillLevelDisplay = (level: string): string => {
  const levelMap: Record<string, string> = {
    "AllLevels": "All Levels Welcome",
    "Beginner": "Beginner",
    "Intermediate": "Intermediate",
    "Advanced": "Advanced",
  };
  return levelMap[level] || level;
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

// Get duration in hours
const getDurationDisplay = (minutes: number): string => {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    if (remainingMins === 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    }
    return `${hours}h ${remainingMins}m`;
  }
  return `${minutes} minutes`;
};

export default function JoinGameDetails() {
  const params = useParams();
  const gameId = params?.id as string;
  const router = useRouter();
  const pathname = usePathname();

  // Auth guard - token lives in the persisted store, cookie is the fallback
  const storeToken = useSelector((state: RootState) => state.auth?.token);
  const isAuthenticated = !!storeToken || !!Cookies.get("token");

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [duration, setDuration] = useState("1 hour");
  const [activity, setActivity] = useState("🏀 Playing");
  const [lookingForGame, setLookingForGame] = useState(false);

  // Send guests to login, remembering where they were headed
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, pathname, router]);

  const { data: gameDetails, isLoading, isError, refetch } = useGetGameDetailsQuery(gameId, {
    skip: !gameId || !isAuthenticated,
  });

  // Check In Mutation
  const [checkinGameFn, { isLoading: isCheckingIn }] = useCheckinGameMutation();

  // Extract game data from response
  const game = gameDetails?.result;

  // Check in happens on the court this game is played at
  const court = game?.court;
  const courtId = court?.id || game?.courtId;
  const courtName = court?.name || "Basketball Court";

  // Get court photos or use fallback
  const courtPhotos = game?.court?.photos || [];
  const images = courtPhotos.length > 0 ? courtPhotos : [
    "https://images.unsplash.com/photo-1577416412292-747c6607f055?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  ];

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1,
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1,
    );
  };

  // Handle Check In - FIXED activity mapping
  const handleCheckIn = async () => {
    if (!courtId) {
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
      courtId: courtId,
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
      // Refetch game data to update check-in count
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to check in");
    }
  };

  // Guests never see the page body - the effect above is navigating them away
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#2b2419] border-2 border-[#FBA30F33] rounded-2xl p-8">
        <div className="flex flex-col items-center justify-center h-[400px] text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <h2 className="mt-4 text-xl font-semibold text-title">
            Please log in to join this game
          </h2>
          <p className="mt-2 text-description">
            Redirecting you to the login page...
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#2b2419] border-2 border-[#FBA30F33] rounded-2xl p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-white/10 rounded" />
          <div className="h-[500px] w-full bg-white/10 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 w-64 bg-white/10 rounded" />
            <div className="h-20 w-full bg-white/10 rounded" />
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-white/10 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !game) {
    return (
      <div className="min-h-screen bg-[#2b2419] border-2 border-[#FBA30F33] rounded-2xl p-8">
        <div className="flex flex-col items-center justify-center h-[400px] text-center">
          <h2 className="text-2xl font-bold text-red-400">Game not found</h2>
          <p className="mt-2 text-description">
            The requested game could not be loaded.
          </p>
          <Link
            href="/games"
            className="mt-4 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-black hover:bg-primary/90"
          >
            Go Back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/games"
        className="text-primary text-lg mb-1 flex items-center gap-2"
      >
        <h1 className="text-2xl font-semibold mb-4 text-primary flex items-center gap-2 cursor-pointer ">
          <FiArrowLeft />
          {game.title || "Game Details"}
        </h1>
      </Link>
      <div className="min-h-screen bg-[#2b2419] border-2 border-[#FBA30F33] rounded-2xl">
        {/* Image Gallery Section */}
        <div className="relative w-full h-[500px] bg-[#2b2419] overflow-hidden rounded-2xl">
          <Image
            src={images[currentImageIndex]}
            alt={game.title || "Game"}
            width={800}
            height={400}
            className="object-cover w-full h-full transition-opacity duration-500 p-4 rounded-2xl"
            priority
            unoptimized
          />

          {/* Image Counter */}
          <div className="absolute top-4 right-4 bg-black/60 px-3 py-1 rounded text-sm">
            {currentImageIndex + 1} / {images.length}
          </div>

          {/* Previous Button */}
          {images.length > 1 && (
            <button
              onClick={handlePrevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-2 rounded-full transition"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Next Button */}
          {images.length > 1 && (
            <button
              onClick={handleNextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-2 rounded-full transition"
            >
              <ChevronRight size={24} />
            </button>
          )}

          {/* Image Dots */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_: any, index: number) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition ${
                    index === currentImageIndex ? "bg-[#FBA30F]" : "bg-white/40"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="px-4 py-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-primary">{game.title}</h1>
            <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(game.status)}`}>
              {game.status || "Scheduled"}
            </span>
          </div>

          {/* Game Description */}
          {game.notes && (
            <div className="mb-8">
              <h2 className="text-xl font-normal mb-3 text-white">Match Description</h2>
              <p className="text-description leading-relaxed">
                {showFullDescription
                  ? game.notes
                  : `${game.notes.slice(0, 120)}...`}
              </p>
              {game.notes.length > 120 && (
                <button
                  type="button"
                  onClick={() => setShowFullDescription((prev) => !prev)}
                  className="mt-2 text-base font-medium text-primary hover:opacity-90"
                >
                  {showFullDescription ? "Show Less" : "Read More"}
                </button>
              )}
            </div>
          )}

          {/* Game Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <p className="text-title text-lg">Game Type:</p>
                <p className="text-description font-medium">
                  {getGameTypeDisplay(game.gameType)}
                </p>
              </div>

              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <p className="text-title text-lg">Date:</p>
                <p className="text-description font-medium">
                  {formatGameDateShort(game.startTime)}
                </p>
              </div>

              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <p className="text-title text-lg">Time:</p>
                <p className="text-description font-medium">
                  {formatGameTime(game.startTime)}
                </p>
              </div>

              <div className="flex justify-between items-start border-b border-white/10 pb-2">
                <p className="text-title text-lg">Court:</p>
                <p className="text-description font-medium text-right max-w-[60%]">
                  {game.court?.name || "Unknown Court"}
                  <br />
                  <span className="text-sm text-description/70">
                    {game.court?.address || "Address unavailable"}
                  </span>
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <p className="text-title text-lg">Duration:</p>
                <p className="text-description font-medium">
                  {getDurationDisplay(game.durationMins)}
                </p>
              </div>

              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <p className="text-title text-lg">Players:</p>
                <p className="text-description font-medium">
                  {game.participants?.length || 0} / {game.maxPlayers}
                </p>
              </div>

              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <p className="text-title text-lg">Skill Level:</p>
                <p className="text-description font-medium">
                  {getSkillLevelDisplay(game.skillLevel)}
                </p>
              </div>

              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <p className="text-title text-lg">Host:</p>
                <p className="text-description font-medium flex items-center gap-2">
                  {game.host?.profileImage && (
                    <Image
                      src={game.host.profileImage}
                      alt={game.host.userName || "Host"}
                      width={24}
                      height={24}
                      className="rounded-full"
                      unoptimized
                    />
                  )}
                  {game.host?.userName || "Unknown"}
                </p>
              </div>
            </div>
          </div>

          {/* Participants Section */}
          {game.participants && game.participants.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-3 text-white">Participants</h3>
              <div className="flex flex-wrap gap-3">
                {game.participants.map((participant: any) => (
                  <div
                    key={participant.id}
                    className="flex items-center gap-2 bg-white/5 rounded-full px-3 py-1.5 border border-white/10"
                  >
                    {participant.user?.profileImage && (
                      <Image
                        src={participant.user.profileImage}
                        alt={participant.user.userName || "Player"}
                        width={24}
                        height={24}
                        className="rounded-full"
                        unoptimized
                      />
                    )}
                    <span className="text-sm text-title">
                      {participant.user?.userName || "Unknown Player"}
                    </span>
                    <span className="text-xs text-emerald-400">
                      {participant.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Check In Button */}
          <div className="mt-10">
            <button
              onClick={() => setCheckInOpen(true)}
              className="w-full bg-primary hover:bg-primary/90 text-black font-normal py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              Check In <BsBoxArrowInRight size={20} />
            </button>
          </div>
        </div>
      </div>

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
    </div>
  );
}