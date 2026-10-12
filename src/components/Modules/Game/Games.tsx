"use client";

import { addDays, format } from "date-fns";
import { CalendarDays, Clock3, Plus, Search, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { BsBoxArrowInRight } from "react-icons/bs";
import { RiGlobalFill } from "react-icons/ri";
import { CustomModal } from "../../modal/CustomModal";
import AllGames from "./AllGames";
import MyGames from "./MyGames";
import { useGetAllGamesQuery, useMyGamesQuery, useCreateGameMutation } from "@/redux/api/gameApi";
import { useGetCourtsQuery } from "@/redux/api/courtsApi";
import { toast } from "sonner";

type GamesState = {
  activeTab: "all" | "mine";
  selectedDate: Date;
  courtSelectOpen: boolean;
  createGameOpen: boolean;
  courtSearchQuery: string;
  selectedCourt: {
    id: string;
    name: string;
    address: string;
  } | null;
  gameTitle: string;
  gameType: string;
  gameDate: string;
  gameTime: string;
  duration: string;
  maxPlayers: string;
  skillLevel: string;
  notes: string;
  playerName: string;
  makePublic: boolean;
  allGamesPage: number;
  myGamesPage: number;
};

// Map game type to API format
const mapGameTypeToApi = (type: string): string => {
  const typeMap: Record<string, string> = {
    "🏀 Pickup": "Pickup",
    "⚡ 3v3": "threeOnThree",
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
  };
  return durationMap[duration] || 60;
};

export default function Games() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "mine" ? "mine" : "all";

  const [state, setState] = useState<GamesState>({
    activeTab: initialTab,
    selectedDate: new Date(),
    courtSelectOpen: false,
    createGameOpen: false,
    courtSearchQuery: "",
    selectedCourt: null,
    gameTitle: "",
    gameType: "🏀 Pickup",
    gameDate: "",
    gameTime: "",
    duration: "1 hour",
    maxPlayers: "10",
    skillLevel: "All Levels Welcome",
    notes: "",
    playerName: "",
    makePublic: true,
    allGamesPage: 1,
    myGamesPage: 1,
  });

  // Fetch All Games
  const {
    data: allGamesData,
    isLoading: allGamesLoading,
    refetch: refetchAllGames,
  } = useGetAllGamesQuery({
    limit: 10,
    page: state.allGamesPage,
    date: format(state.selectedDate, "yyyy-MM-dd"),
  });

  // Fetch My Games
  const {
    data: myGamesData,
    isLoading: myGamesLoading,
    refetch: refetchMyGames,
  } = useMyGamesQuery({
    limit: 10,
    page: state.myGamesPage,
  });

  // Fetch All Courts
  const {
    data: getAllCourtsData,
    isLoading: getAllCourtsLoading,
  } = useGetCourtsQuery({
    limit: 2000,
    page: 1,
    search: state.courtSearchQuery || undefined,
  });

  // Create Game Mutation
  const [createGameFn, { isLoading: isCreatingGame }] = useCreateGameMutation();

  

  const setField = <K extends keyof GamesState>(
    key: K,
    value: GamesState[K],
  ) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const days = useMemo(() => {
    const arr = [] as Date[];
    for (let i = 0; i < 10; i++) arr.push(addDays(new Date(), i));
    return arr;
  }, []);

  // Get courts from API response
  const courts = useMemo(() => {
    const courtsData = getAllCourtsData?.result?.courts || [];
    return courtsData.map((court: any) => ({
      id: court.id,
      name: court.name,
      address: court.address,
    }));
  }, [getAllCourtsData]);

  // Filter courts based on search query
  const filteredCourts = useMemo(() => {
    const query = state.courtSearchQuery.trim().toLowerCase();
    if (!query) return courts;
    return courts.filter(
      (court: any) =>
        court.name.toLowerCase().includes(query) ||
        court.address.toLowerCase().includes(query),
    );
  }, [courts, state.courtSearchQuery]);

  const openCreateFlow = () => {
    setState((prev) => ({
      ...prev,
      courtSelectOpen: true,
      createGameOpen: false,
      courtSearchQuery: "",
    }));
  };

  const handleCourtSelect = (court: any) => {
    setState((prev) => ({
      ...prev,
      selectedCourt: court,
      courtSelectOpen: false,
      createGameOpen: true,
    }));
  };

  // Handle Create Game
  const handleCreateGame = async () => {
    // Validate required fields
    if (!state.gameDate) {
      toast.error("Please select a date");
      return;
    }
    if (!state.gameTime) {
      toast.error("Please select a time");
      return;
    }
    if (!state.selectedCourt?.id) {
      toast.error("Please select a court");
      return;
    }

    // Combine date and time into ISO string
    const dateTimeString = `${state.gameDate}T${state.gameTime}:00`;
    const startTime = new Date(dateTimeString).toISOString();

    // Map values to API format
    const apiGameType = mapGameTypeToApi(state.gameType);
    const apiSkillLevel = mapSkillLevelToApi(state.skillLevel);
    const durationMins = mapDurationToMinutes(state.duration);

    // Prepare request body
    const requestBody = {
      title: state.gameTitle.trim() || `${state.selectedCourt.name} Game`,
      courtId: state.selectedCourt.id,
      gameType: apiGameType,
      startTime: startTime,
      durationMins: durationMins,
      maxPlayers: parseInt(state.maxPlayers) || 10,
      skillLevel: apiSkillLevel,
      notes: state.notes.trim() || undefined,
    };

    try {
      await createGameFn(requestBody).unwrap();
      toast.success("Game created successfully!");
      setState((prev) => ({
        ...prev,
        createGameOpen: false,
        gameTitle: "",
        gameDate: "",
        gameTime: "",
        notes: "",
        selectedCourt: null,
      }));
      // Refetch games
      refetchAllGames();
      refetchMyGames();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create game");
    }
  };

  // Handle page change for All Games
  const handleAllGamesPageChange = (page: number) => {
    setState((prev) => ({ ...prev, allGamesPage: page }));
  };

  // Handle page change for My Games
  const handleMyGamesPageChange = (page: number) => {
    setState((prev) => ({ ...prev, myGamesPage: page }));
  };

  return (
    <div className="min-h-[620px] rounded-[2px] bg-[#14161b] text-title my-2">
      <div className="mx-auto w-full px-4 py-3 lg:px-0 lg:py-4">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold leading-none">Games</h2>
            <p className="mt-2 text-base text-description">Scheduled games</p>
          </div>

          <button
            onClick={openCreateFlow}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FBA30F] to-[#D25A00] px-4 hover:opacity-90 py-2 text-base font-normal text-white shadow-[0_10px_20px_rgba(251,163,15,0.12)]"
          >
            <Plus size={16} />
            Create Game
          </button>
        </div>

        <div className="mb-5 flex items-center gap-5 overflow-x-auto p-1">
          {days.map((d) => {
            const isToday =
              format(d, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
            const active =
              format(d, "yyyy-MM-dd") ===
              format(state.selectedDate, "yyyy-MM-dd");

            return (
              <button
                key={d.toISOString()}
                onClick={() => {
                  setField("selectedDate", d);
                  // Reset pagination when date changes
                  setState((prev) => ({
                    ...prev,
                    allGamesPage: 1,
                    myGamesPage: 1,
                  }));
                }}
                className={`w-24 md:min-w-[138px] h-16 md:h-28 rounded-sm p-2 md:rounded-xl text-center transition-colors ${
                  active
                    ? "bg-primary text-black"
                    : "bg-[#2b2d33] text-description"
                }`}
              >
                <div className="text-sm md:text-lg leading-none">
                  {isToday ? "Today" : format(d, "EEE")}
                </div>
                <div className="mt-2 text-sm md:text-lg font-semibold leading-none">
                  {format(d, "d")}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mb-6 overflow-hidden rounded-2xl border border-[#fba30f3d] bg-[#111214] p-4">
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => {
                setField("activeTab", "all");
                setField("allGamesPage", 1);
              }}
              className={`rounded-xl py-3 text-base font-medium transition-colors ${
                state.activeTab === "all"
                  ? "bg-primary text-black"
                  : "text-description hover:bg-white/5"
              }`}
            >
              All Games
            </button>
            <button
              onClick={() => {
                setField("activeTab", "mine");
                setField("myGamesPage", 1);
              }}
              className={`rounded-xl py-3 text-base font-medium transition-colors ${
                state.activeTab === "mine"
                  ? "bg-primary text-black"
                  : "text-description hover:bg-white/5"
              }`}
            >
              My Games
            </button>
          </div>
        </div>

        <div className="mt-3">
          {state.activeTab === "all" ? (
            <AllGames
              gamesData={allGamesData}
              isLoading={allGamesLoading}
              currentPage={state.allGamesPage}
              onPageChange={handleAllGamesPageChange}
              onRefetch={refetchAllGames}
              selectedDate={state.selectedDate}
            />
          ) : (
            <MyGames
              gamesData={myGamesData}
              isLoading={myGamesLoading}
              currentPage={state.myGamesPage}
              onPageChange={handleMyGamesPageChange}
              onRefetch={refetchMyGames}
              selectedDate={state.selectedDate}
            />
          )}
        </div>

        {/* Select Court Modal */}
        <CustomModal
          open={state.courtSelectOpen}
          onClose={() => setField("courtSelectOpen", false)}
          title={undefined}
          maxWidth="3xl"
          showCloseButton={false}
        >
          <div className="relative rounded-2xl bg-[#242424] p-4 text-white">
            <button
              type="button"
              onClick={() => setField("courtSelectOpen", false)}
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close court select modal"
            >
              <X size={20} />
            </button>

            <div className="text-center">
              <h2 className="text-2xl font-semibold text-title">
                Select a Court
              </h2>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <p className="mb-2 text-sm text-title">Search Courts</p>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-description" />
                  <input
                    value={state.courtSearchQuery}
                    onChange={(e) =>
                      setField("courtSearchQuery", e.target.value)
                    }
                    placeholder="Search Court....."
                    className="h-11 w-full rounded-xl border border-white/10 bg-black px-10 text-sm text-title outline-none placeholder:text-description focus:border-primary"
                  />
                </div>
              </div>

              <div className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
                {getAllCourtsLoading ? (
                  <div className="text-center text-description py-4">Loading courts...</div>
                ) : filteredCourts.length === 0 ? (
                  <div className="text-center text-description py-4">No courts found</div>
                ) : (
                  filteredCourts.map((court: any) => (
                    <button
                      type="button"
                      key={court.id}
                      onClick={() => handleCourtSelect(court)}
                      className="w-full rounded-xl bg-[#3a3a3a] px-4 py-3 text-left transition-colors hover:bg-[#444]"
                    >
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 text-sm">🏀</span>
                        <div>
                          <p className="text-sm font-semibold text-title">
                            {court.name}
                          </p>
                          <p className="mt-1 text-xs text-description">
                            {court.address}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </CustomModal>

        {/* Create Game Modal - Fixed Design */}
        <CustomModal
          open={state.createGameOpen}
          onClose={() => setField("createGameOpen", false)}
          title={undefined}
          maxWidth="3xl"
          showCloseButton={false}
        >
          <div className="relative rounded-2xl bg-[#242424] p-3 text-white">
            <button
              type="button"
              onClick={() => setField("createGameOpen", false)}
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close create game modal"
            >
              <X size={20} />
            </button>

            <div className="text-center">
              <h2 className="text-2xl font-semibold text-title">
                Create a Game
              </h2>
              <p className="mt-1 text-lg text-description">
                {state.selectedCourt?.name || "Select a Court"}
              </p>
            </div>

            <div className="mt-4 space-y-3">
              {/* Game Title */}
              <div>
                <label className="mb-2 block text-sm font-medium text-title">
                  Game Title (optional)
                </label>
                <input
                  value={state.gameTitle}
                  onChange={(e) => setField("gameTitle", e.target.value)}
                  placeholder="e.g., Sunday Runs"
                  className="w-full rounded-lg border border-white/20 bg-[#242424] px-3 py-2 text-base text-description outline-none focus:border-primary"
                />
              </div>

              {/* Game Type */}
              <div>
                <label className="mb-2 block text-sm font-medium text-title">
                  Game Type
                </label>
                <select
                  value={state.gameType}
                  onChange={(e) => setField("gameType", e.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-[#242424] px-3 py-2 text-base text-description outline-none focus:border-primary"
                >
                  <option className="bg-[#242424] text-white">🏀 Pickup</option>
                  <option className="bg-[#242424] text-white">⚡ 3v3</option>
                  <option className="bg-[#242424] text-white">🔥 5v5</option>
                  <option className="bg-[#242424] text-white">🎯 Shootaround</option>
                  <option className="bg-[#242424] text-white">🏆 Tournament</option>
                </select>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-title">Date</label>
                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-description" />
                    <input
                      type="date"
                      value={state.gameDate}
                      onChange={(e) => setField("gameDate", e.target.value)}
                      className="w-full rounded-lg border border-white/20 bg-[#242424] py-2 pl-9 pr-3 text-base text-description outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-title">Time</label>
                  <div className="relative">
                    <Clock3 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-description" />
                    <input
                      type="time"
                      value={state.gameTime}
                      onChange={(e) => setField("gameTime", e.target.value)}
                      className="w-full rounded-lg border border-white/20 bg-[#242424] py-2 pl-9 pr-3 text-base text-description outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Duration & Max Players */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-title">
                    Duration
                  </label>
                  <select
                    value={state.duration}
                    onChange={(e) => setField("duration", e.target.value)}
                    className="w-full rounded-lg border border-white/20 bg-[#242424] px-3 py-2 text-base text-description outline-none focus:border-primary"
                  >
                    <option className="bg-[#242424] text-white">1 hour</option>
                    <option className="bg-[#242424] text-white">1.5 hours</option>
                    <option className="bg-[#242424] text-white">2 hours</option>
                    <option className="bg-[#242424] text-white">3 hours</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-title">
                    Max Players
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="20"
                    value={state.maxPlayers}
                    onChange={(e) => setField("maxPlayers", e.target.value)}
                    className="w-full rounded-lg border border-white/20 bg-[#242424] px-3 py-2 text-base text-description outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Skill Level */}
              <div>
                <label className="mb-2 block text-sm font-medium text-title">
                  Skill Level
                </label>
                <select
                  value={state.skillLevel}
                  onChange={(e) => setField("skillLevel", e.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-[#242424] px-3 py-2 text-base text-description outline-none focus:border-primary"
                >
                  <option className="bg-[#242424] text-white">All Levels Welcome</option>
                  <option className="bg-[#242424] text-white">Beginner</option>
                  <option className="bg-[#242424] text-white">Intermediate</option>
                  <option className="bg-[#242424] text-white">Advanced</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="mb-2 block text-sm font-medium text-title">
                  Notes (optional)
                </label>
                <textarea
                  value={state.notes}
                  onChange={(e) => setField("notes", e.target.value)}
                  rows={6}
                  placeholder="Any additional info..."
                  className="w-full rounded-lg border border-white/20 bg-[#242424] px-3 py-2 text-base text-description outline-none focus:border-primary"
                />
              </div>

              {/* Schedule Game Button */}
              <div className="pt-6">
                <button
                  onClick={handleCreateGame}
                  disabled={isCreatingGame}
                  className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-base font-normal text-black hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isCreatingGame ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <BsBoxArrowInRight size={20} />
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
  );
}