"use client";

import { Play, Video } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { HighlightItem } from "@/redux/api/highlightApi";
import {
  DEFAULT_HIGHLIGHT_THUMBNAIL,
  formatPlayType,
  formatViews,
} from "./highlightData";

interface AllHighlightsProps {
  highlights?: HighlightItem[];
  isLoading?: boolean;
}

export default function AllHighlights({
  highlights = [],
  isLoading = false,
}: AllHighlightsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 p-1">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
          <div
            key={idx}
            className="animate-pulse rounded-[24px] bg-white/5 border border-white/10 aspect-[16/11] w-full"
          />
        ))}
      </div>
    );
  }

  if (!highlights || highlights.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/5 text-description">
          <Video className="h-7 w-7" />
        </div>
        <p className="text-lg font-semibold text-title">No highlights found</p>
        <p className="mt-1 text-sm text-description">
          No video highlights match your current selection.
        </p>
      </div>
    );
  }

  return (
    <section className="p-1 md:p-2">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {highlights.map((item) => {
          const thumbnailSrc =
            item.thumbnailUrl ||
            (item.mediaUrl &&
            !item.mediaUrl.endsWith(".mp4") &&
            !item.mediaUrl.endsWith(".mov") &&
            !item.mediaUrl.endsWith(".webm")
              ? item.mediaUrl
              : DEFAULT_HIGHLIGHT_THUMBNAIL);

          return (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-[24px] bg-[#131720] border border-white/5 transition-all duration-300 hover:border-primary/40 hover:shadow-[0_8px_30px_rgba(251,163,15,0.12)]"
            >
              <div className="relative w-full aspect-[16/11] overflow-hidden">
                {item.mediaUrl &&
                (item.mediaUrl.endsWith(".mp4") ||
                  item.mediaUrl.endsWith(".mov") ||
                  item.mediaUrl.endsWith(".webm")) ? (
                  <video
                    src={item.mediaUrl}
                    preload="metadata"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    muted
                  />
                ) : (
                  <Image
                    src={thumbnailSrc}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20" />

                {/* Duration & Play Type Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                  <span className="rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-xs font-medium text-primary border border-primary/20">
                    {formatPlayType(item.playType)}
                  </span>
                  {item.durationSeconds ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-xs text-white/90">
                      {Math.floor(item.durationSeconds / 60)}:
                      {String(item.durationSeconds % 60).padStart(2, "0")}
                    </span>
                  ) : null}
                </div>

                {/* Play Button Link */}
                <Link
                  href={`/highlights/${item.id}`}
                  className="absolute inset-0 flex items-center justify-center z-10"
                  aria-label={`Watch ${item.title}`}
                >
                  <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full bg-white/40 backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:bg-primary">
                    <Play className="ml-1 h-5 w-5 md:h-6 md:w-6 fill-[#111827] text-[#111827]" />
                  </div>
                </Link>

                {/* Bottom details */}
                <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-2 p-3.5 z-10 pointer-events-none">
                  <div className="min-w-0">
                    <h3 className="line-clamp-1 text-sm font-semibold text-white group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {item.court?.name && (
                        <p className="line-clamp-1 text-xs text-white/60">
                          {item.court.name}
                        </p>
                      )}
                      {item.uploader?.userName && (
                        <p className="line-clamp-1 text-xs text-white/40">
                          • {item.uploader.userName}
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="shrink-0 text-xs font-medium text-white/80 bg-white/10 px-2 py-0.5 rounded-md backdrop-blur-sm">
                    {formatViews(item.views)} views
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}


