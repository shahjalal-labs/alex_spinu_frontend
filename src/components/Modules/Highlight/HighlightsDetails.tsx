"use client";

import { CustomModal } from "@/components/modal/CustomModal";
import {
  useDeleteHighlightMutation,
  useGetHighlightByIdQuery,
  useGetHighlightsQuery,
} from "@/redux/api/highlightApi";
import { useGetMeQuery } from "@/redux/api/userApi";
import { RootState } from "@/redux/store";
import {
  Clock,
  Eye,
  Heart,
  Loader2,
  MapPin,
  Play,
  Trash2,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import {
  DEFAULT_HIGHLIGHT_THUMBNAIL,
  formatPlayType,
  formatViews,
} from "./highlightData";

export default function HighlightsDetails() {
  const router = useRouter();
  const params = useParams();
  const highlightId = (params?.id as string) || "";

  const [showFull, setShowFull] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // RTK Query: Fetch single highlight
  const {
    data: singleData,
    isLoading,
    isError,
  } = useGetHighlightByIdQuery(highlightId, { skip: !highlightId });

  // RTK Query: Fetch other highlights for "More Highlights"
  const { data: allData } = useGetHighlightsQuery({ limit: 6 });

  // RTK Mutation: Delete highlight
  const [deleteHighlightFn, { isLoading: isDeleting }] =
    useDeleteHighlightMutation();

  // Current logged in user (to check ownership)
  const storeToken = useSelector((state: RootState) => state.auth?.token);
  const { data: profileData } = useGetMeQuery(undefined, { skip: !storeToken });
  const currentUserId = profileData?.result?.id || profileData?.data?.id;

  const highlight = useMemo(() => {
    return singleData?.data || singleData?.result;
  }, [singleData]);

  const isOwner = useMemo(() => {
    if (!currentUserId || !highlight) return false;
    return (
      highlight.uploaderId === currentUserId ||
      highlight.uploader?.id === currentUserId
    );
  }, [currentUserId, highlight]);

  const relatedHighlights = useMemo(() => {
    const list =
      allData?.data?.highlights || allData?.result?.highlights || [];
    return list.filter((h) => h.id !== highlightId).slice(0, 3);
  }, [allData, highlightId]);

  const handleDelete = async () => {
    if (!highlightId) return;

    try {
      await deleteHighlightFn(highlightId).unwrap();
      toast.success("Highlight deleted successfully!");
      setDeleteModalOpen(false);
      router.push("/highlights");
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
          error?.message ||
          "Failed to delete highlight. Please try again."
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-description">Loading highlight...</p>
      </div>
    );
  }

  if (isError || !highlight) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
        <h2 className="text-2xl font-bold text-red-400">
          Highlight not found
        </h2>
        <p className="text-description text-sm max-w-md">
          The highlight clip you are trying to view does not exist or has been removed.
        </p>
        <button
          onClick={() => router.push("/highlights")}
          className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-black hover:bg-primary/90"
        >
          Back to Highlights
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      <div className="mx-auto max-w-5xl">
        {/* Navigation Bar */}
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/highlights")}
            className="inline-flex items-center gap-2 text-title hover:text-primary transition-colors text-base font-medium"
          >
            <FiArrowLeft className="h-5 w-5" />
            <span>Back to Highlights</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-semibold text-primary">
              {formatPlayType(highlight.playType)}
            </span>

            {isOwner && (
              <button
                type="button"
                onClick={() => setDeleteModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors"
                title="Delete this highlight"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>

        {/* Highlight Main Card */}
        <div className="overflow-hidden rounded-2xl border border-primary/20 bg-[#16181e] shadow-xl">
          {/* Media Video Player Frame */}
          <div className="relative aspect-[16/9] w-full bg-black">
            {highlight.mediaUrl ? (
              <video
                src={highlight.mediaUrl}
                controls
                autoPlay
                className="h-full w-full object-contain"
                poster={highlight.thumbnailUrl || undefined}
              />
            ) : (
              <div className="relative h-full w-full">
                <Image
                  src={highlight.thumbnailUrl || DEFAULT_HIGHLIGHT_THUMBNAIL}
                  alt={highlight.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-description text-sm">
                  No video stream available
                </div>
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="p-6 md:p-8 space-y-6">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-title">
                  {highlight.title}
                </h1>
              </div>

              {/* Metadata Badges Row */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-description mt-3">
                {highlight.court?.name && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>
                      {highlight.court.name}
                      {highlight.court.address
                        ? ` (${highlight.court.address})`
                        : ""}
                    </span>
                  </span>
                )}

                {highlight.uploader?.userName && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5">
                    {highlight.uploader.profileImage ? (
                      <Image
                        src={highlight.uploader.profileImage}
                        alt="uploader"
                        width={20}
                        height={20}
                        className="h-5 w-5 rounded-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <User className="h-4 w-4 text-primary" />
                    )}
                    <span>{highlight.uploader.userName}</span>
                  </span>
                )}

                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5">
                  <Eye className="h-4 w-4 text-primary" />
                  <span>{formatViews(highlight.views)} views</span>
                </span>

                {typeof highlight.likes === "number" && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5">
                    <Heart className="h-4 w-4 text-red-400" />
                    <span>{highlight.likes} likes</span>
                  </span>
                )}

                {highlight.createdAt && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5">
                    <Clock className="h-4 w-4 text-description" />
                    <span>
                      {new Date(highlight.createdAt).toLocaleDateString(
                        undefined,
                        { month: "short", day: "numeric", year: "numeric" }
                      )}
                    </span>
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {highlight.description && (
              <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4">
                <h2 className="text-sm font-semibold text-title mb-1.5">
                  About this clip
                </h2>
                <p className="text-sm md:text-base leading-relaxed text-description">
                  {showFull
                    ? highlight.description
                    : `${highlight.description.slice(0, 160)}${
                        highlight.description.length > 160 ? "..." : ""
                      }`}
                </p>
                {highlight.description.length > 160 && (
                  <button
                    type="button"
                    onClick={() => setShowFull((s) => !s)}
                    className="mt-2 text-sm font-medium text-primary hover:underline"
                  >
                    {showFull ? "Show Less" : "Read More"}
                  </button>
                )}
              </div>
            )}

            {/* Specs Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-white/10 pt-4 text-sm">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <span className="text-description">Play Type:</span>
                <span className="font-semibold text-title">
                  {formatPlayType(highlight.playType)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <span className="text-description">Views:</span>
                <span className="font-semibold text-title">
                  {formatViews(highlight.views)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <span className="text-description">Likes:</span>
                <span className="font-semibold text-title">
                  {highlight.likes ?? 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* More Highlights */}
        {relatedHighlights.length > 0 && (
          <div className="mt-12 space-y-4">
            <h2 className="text-xl font-bold text-title">More Highlights</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedHighlights.map((item) => (
                <Link
                  key={item.id}
                  href={`/highlights/${item.id}`}
                  className="group block overflow-hidden rounded-xl border border-white/10 bg-[#16181e] transition-all hover:border-primary/40"
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-black">
                    {item.mediaUrl && (item.mediaUrl.endsWith(".mp4") || item.mediaUrl.endsWith(".mov") || item.mediaUrl.endsWith(".webm")) ? (
                      <video
                        src={item.mediaUrl}
                        preload="metadata"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        muted
                      />
                    ) : (
                      <Image
                        src={item.thumbnailUrl || DEFAULT_HIGHLIGHT_THUMBNAIL}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        unoptimized
                      />
                    )}
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute top-2 left-2 rounded bg-black/60 px-2 py-0.5 text-[11px] font-medium text-primary">
                      {formatPlayType(item.playType)}
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="line-clamp-1 text-sm font-semibold text-title group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs text-description">
                      {formatViews(item.views)} views
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <CustomModal
        open={deleteModalOpen}
        onClose={() => !isDeleting && setDeleteModalOpen(false)}
        title=""
        actions={[
          {
            label: "Cancel",
            onClick: () => setDeleteModalOpen(false),
            variant: "secondary",
          },
          {
            label: isDeleting ? "Deleting..." : "Delete",
            onClick: handleDelete,
            variant: "primary",
          },
        ]}
      >
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border border-red-500/30 text-red-500">
            <Trash2 size={28} />
          </div>

          <h3 className="text-2xl font-bold text-title">Delete Highlight</h3>
          <p className="text-sm text-description max-w-xs">
            Are you sure you want to delete this highlight? This action cannot be undone.
          </p>
        </div>
      </CustomModal>
    </div>
  );
}
