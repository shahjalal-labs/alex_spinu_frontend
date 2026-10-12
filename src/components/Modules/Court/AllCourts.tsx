"use client";

import { calculateDistanceInMiles } from "@/lib/utils";
import { Court, useGetCourtsQuery } from "@/redux/api/courtsApi";
import { MapPin, Star, Sun } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1518063319789-7217e6706b04?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1519766304817-4f37bda74a26?auto=format&fit=crop&w=1200&q=80",
];

interface AllCourtsProps {
  query: string;
  courtType?: string;
  lighting?: string;
  admission?: string;
  userLocation?: { lat: number; lng: number } | null;
  radius?: number;
  amenities?: Record<string, boolean>;
}

export default function AllCourts({
  query,
  courtType,
  lighting,
  admission,
  userLocation,
  radius,
  amenities,
}: AllCourtsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9; // Number of cards per page

  // Convert miles to meters for API
  const distanceMeters = radius ? Math.round(radius * 1609.34) : undefined;
  const amenitiesStr = Object.keys(amenities || {}).filter(k => amenities?.[k]).join(",") || undefined;

  const { data, isLoading, isError, error } = useGetCourtsQuery({
    search: query || undefined,
    courtType: courtType && courtType !== "all" ? courtType : undefined,
    hasNightLight:
      lighting === "yes" ? true : lighting === "no" ? false : undefined,
    distance: distanceMeters,
    latitude: radius && userLocation ? userLocation.lat : undefined,
    longitude: radius && userLocation ? userLocation.lng : undefined,
    amenities: amenitiesStr,
    page: currentPage,
    limit: pageSize,
  });

  // Reset to page 1 when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [query, courtType, lighting, admission, radius, amenities]);

  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to top of list when page changes
  useEffect(() => {
    if (containerRef.current) {
      // Small delay ensures content has started rendering before scrolling
      setTimeout(() => {
        const topOffset = containerRef.current?.getBoundingClientRect().top;
        const currentScrollY = window.scrollY;
        
        // Only scroll if the top of the container is above the viewport
        if (topOffset && topOffset < 100) {
           window.scrollTo({
             top: currentScrollY + topOffset - 100, // Offset for sticky headers if any
             behavior: "smooth",
           });
        }
      }, 100);
    }
  }, [currentPage]);

  const totalItems = data?.data?.total ?? data?.result?.total ?? (data as any)?.total ?? 0;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  // Move rawCourts extraction inside useMemo to avoid dependency issues
  const paginatedCourts = useMemo(() => {
    const rawCourts: Court[] =
      data?.data?.courts ?? data?.result?.courts ?? (data as any)?.courts ?? [];

    return rawCourts
      .filter((court) => {
        // We still keep the admission filter locally just in case the backend doesn't support "paid" vs "free" properly
        const fee =
          typeof court.admissionFee === "number"
            ? court.admissionFee
            : parseFloat(String(court.admissionFee ?? "").replace(/[^0-9.]/g, "")) || 0;

        if (admission === "free") {
          if (fee > 0) return false;
        } else if (admission === "paid") {
          if (fee <= 0) return false;
        }

        return true;
      })
      .map((court) => {
        let distance: number | undefined = undefined;
        if (
          userLocation &&
          typeof court.latitude === "number" &&
          typeof court.longitude === "number"
        ) {
          distance = calculateDistanceInMiles(
            userLocation.lat,
            userLocation.lng,
            court.latitude,
            court.longitude
          );
        }
        return { ...court, distance };
      })
      .sort((a, b) => {
        if (a.distance !== undefined && b.distance !== undefined) {
          return a.distance - b.distance;
        }
        return 0;
      });
  }, [
    data,
    userLocation,
    admission,
  ]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 mt-10">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-3xl border border-primary/20 bg-[#171717] animate-pulse"
          >
            <div className="h-44 w-full bg-white/5" />
            <div className="p-4 space-y-3">
              <div className="h-6 w-3/4 rounded bg-white/10" />
              <div className="h-4 w-full rounded bg-white/5" />
              <div className="flex gap-2">
                <div className="h-8 w-20 rounded bg-white/5" />
                <div className="h-8 w-20 rounded bg-white/5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    const status = (error as any)?.status;
    return (
      <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 py-20 text-center">
        <p className="text-lg font-semibold text-red-400">
          Failed to load courts{status ? ` (${status})` : ""}
        </p>
        <p className="mt-2 text-sm text-description">
          Please check your connection and try again.
        </p>
      </div>
    );
  }

  if (paginatedCourts.length === 0) {
    return (
      <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 py-20 text-center">
        <p className="text-lg font-semibold text-title">No courts found</p>
        <p className="mt-2 text-sm text-description">
          Try adjusting your search or filters.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 mt-10">
        {paginatedCourts.map((court, index) => {
          const photoUrl =
            court.photos && court.photos.length > 0 && court.photos[0]
              ? court.photos[0]
              : FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];

          const tags: string[] = [];
          if (court.numberOfHoops !== null && court.numberOfHoops !== undefined) {
            tags.push(`${court.numberOfHoops} Hoops`);
          }
          if (court.surface) {
            tags.push(`Surface: ${court.surface}`);
          }
          if (court.hasNightLight !== undefined && court.hasNightLight !== null) {
            tags.push(court.hasNightLight ? "Night Lights" : "No Night Lights");
          }
          if (court.admissionFee === 0) {
            tags.push("Free");
          } else if (court.admissionFee && court.admissionFee > 0) {
            tags.push(`$${court.admissionFee}`);
          }

          if (Array.isArray(court.amenities) && court.amenities.length > 0) {
            court.amenities.forEach((amenity) => {
              if (amenity && !tags.includes(amenity)) tags.push(amenity);
            });
          }

          const ratingDisplay =
            typeof court.avgRating === "number" && court.avgRating > 0
              ? court.avgRating.toFixed(1)
              : "0.0";

          return (
            <Link key={court.id} href={`/all-court/${court.id}`}>
              <article className="overflow-hidden rounded-3xl border border-primary/20 bg-[#171717] cursor-pointer transition-transform hover:scale-[1.01] hover:border-primary/50">
                <div className="relative h-44 w-full overflow-hidden">
                  <Image
                    src={photoUrl}
                    alt={court.name}
                    width={400}
                    height={200}
                    className="h-full w-full object-cover object-center"
                    unoptimized
                  />
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-[#FBA30F]/30 to-[#D25A00]/30 px-3 py-2 text-base text-white backdrop-blur-[1px]">
                    <Sun size={20} />
                    {court.courtType || "Outdoor"}
                  </span>
                </div>

                <div className="p-4">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <h3 className="text-2xl font-semibold text-title truncate">
                      {court.name}
                    </h3>
                    <span className="shrink-0 inline-flex items-center gap-2 rounded-md bg-[#FFF7E81A] px-4 py-2 text-base text-primary">
                      <Star size={18} className="fill-primary text-primary" />
                      {ratingDisplay}
                    </span>
                  </div>

                  <p className="mb-3 flex items-center gap-1.5 text-base text-description truncate">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {court.address}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {tags.length > 0 ? (
                      tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-[#FFF7E81A] px-4 py-2 text-base text-[#d0d3da]"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="rounded-md bg-[#FFF7E81A] px-4 py-2 text-base text-[#d0d3da]">
                        Surface: {court.surface || "Outdoor"}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            </Link>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8 mb-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center justify-center h-10 w-10 rounded-lg border border-primary/20 bg-[#171717] text-white hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              // Show limited pages (first, last, current, and adjacent) to avoid wide pagination bars
              if (
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
              ) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`h-10 w-10 rounded-lg border text-base font-medium transition-colors ${
                      currentPage === pageNum
                        ? "bg-primary border-primary text-black"
                        : "border-primary/20 bg-[#171717] text-white hover:border-primary"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              } else if (
                pageNum === currentPage - 2 ||
                pageNum === currentPage + 2
              ) {
                return <span key={pageNum} className="text-white">...</span>;
              }
              return null;
            })}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center justify-center h-10 w-10 rounded-lg border border-primary/20 bg-[#171717] text-white hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}