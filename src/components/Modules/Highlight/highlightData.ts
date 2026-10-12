import { HighlightItem } from "@/redux/api/highlightApi";

export const PLAY_TYPES = [
  "All",
  "StepBack",
  "Dunk",
  "3-Pointer",
  "Crossover",
  "Block",
  "Assist",
  "GameWinner",
  "Other",
] as const;

export const PLAY_TYPE_OPTIONS = [
  { value: "StepBack", label: "Step-Back" },
  { value: "Dunk", label: "Dunk" },
  { value: "3-Pointer", label: "3-Pointer" },
  { value: "Crossover", label: "Crossover" },
  { value: "Block", label: "Block" },
  { value: "Assist", label: "Assist" },
  { value: "GameWinner", label: "Game Winner" },
  { value: "Other", label: "Other" },
];

export const formatPlayType = (type?: string): string => {
  if (!type) return "Highlight";
  const map: Record<string, string> = {
    StepBack: "Step-Back",
    GameWinner: "Game Winner",
    ThreePointer: "3-Pointer",
  };
  return map[type] || type;
};

export const formatViews = (views?: number): string => {
  if (views === undefined || views === null) return "0";
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K`;
  return String(views);
};

export const DEFAULT_HIGHLIGHT_THUMBNAIL =
  "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=900&q=80";

export const FALLBACK_HIGHLIGHTS: HighlightItem[] = [
  {
    id: "mock-1",
    title: "Crazy crossover and step-back 3",
    description: "Clutch shot to close out the run",
    playType: "StepBack",
    mediaUrl: "https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=900&q=80",
    views: 1800000,
    likes: 240,
    uploader: { id: "u1", userName: "Marcus 'Silk' Johnson" },
    court: { name: "Rucker Park", address: "155th St & Frederick Douglass Blvd, New York, NY" },
    createdAt: "2026-08-15T12:00:00.000Z",
  },
  {
    id: "mock-2",
    title: "Poster dunk over two defenders",
    description: "An explosive fast break that ended with a thunderous two-handed slam.",
    playType: "Dunk",
    mediaUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=900&q=80",
    views: 2400000,
    likes: 512,
    uploader: { id: "u2", userName: "Darius 'Sky' Walker" },
    court: { name: "Venice Beach Courts" },
    createdAt: "2026-08-18T12:00:00.000Z",
  },
  {
    id: "mock-3",
    title: "Clutch buzzer-beater from half court",
    description: "Down by 2 with 1.8 seconds remaining on the clock to seal the tournament victory.",
    playType: "GameWinner",
    mediaUrl: "https://images.unsplash.com/photo-1547345925-6762f74b2f46?auto=format&fit=crop&w=900&q=80",
    views: 950000,
    likes: 890,
    uploader: { id: "u3", userName: "Tyler Hayes" },
    court: { name: "Holcombe Rucker Park" },
    createdAt: "2026-08-20T12:00:00.000Z",
  },
];
