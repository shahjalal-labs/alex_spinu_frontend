"use client";

import { useGetCourtsQuery } from "@/redux/api/courtsApi";
import {
  useGetHighlightsQuery,
  useUploadHighlightMutation,
} from "@/redux/api/highlightApi";
import { Loader2, Plus, Search, Video, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CustomModal } from "../../modal/CustomModal";
import AllHighlights from "./AllHighlights";
import { PLAY_TYPES, PLAY_TYPE_OPTIONS } from "./highlightData";

interface UploadHighlightProps {
  initialModalOpen?: boolean;
}

export default function UploadHighlight({
  initialModalOpen = false,
}: UploadHighlightProps) {
  const [selectedPlayType, setSelectedPlayType] = useState<string>("All");
  const [selectedCourtId, setSelectedCourtId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [open, setOpen] = useState(initialModalOpen);

  // Form State
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [playType, setPlayType] = useState("StepBack");
  const [formCourtId, setFormCourtId] = useState("");
  const [description, setDescription] = useState("");

  // RTK Queries & Mutations
  const {
    data: highlightsData,
    isLoading: isHighlightsLoading,
    isFetching: isHighlightsFetching,
  } = useGetHighlightsQuery({
    courtId: selectedCourtId || undefined,
    limit: 50,
  });

  const { data: courtsData, isLoading: isCourtsLoading } = useGetCourtsQuery({
    limit: 1000,
    page: 1,
  });

  const [uploadHighlightFn, { isLoading: isUploading }] =
    useUploadHighlightMutation();

  const courts = useMemo(() => {
    return courtsData?.result?.courts || courtsData?.data?.courts || [];
  }, [courtsData]);

  const rawHighlights = useMemo(() => {
    return (
      highlightsData?.data?.highlights ||
      highlightsData?.result?.highlights ||
      []
    );
  }, [highlightsData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (f) {
      if (!f.type.startsWith("video/")) {
        toast.error("Please upload a valid video file (MP4, MOV, WebM, etc.)");
        return;
      }
      setFile(f);
    }
  };

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
      setPreviewUrl(null);
    };
  }, [file]);

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please choose a video file");
      return;
    }
    if (!title.trim()) {
      toast.error("Please enter a highlight title");
      return;
    }

    const formData = new FormData();
    formData.append("highlightVideo", file);

    const bodyData: Record<string, any> = {
      title: title.trim(),
      playType: playType,
    };

    if (formCourtId) {
      bodyData.courtId = formCourtId;
    }
    if (description.trim()) {
      bodyData.description = description.trim();
    }

    formData.append("bodyData", JSON.stringify(bodyData));
    formData.append("data", JSON.stringify(bodyData));

    try {
      await uploadHighlightFn(formData).unwrap();
      toast.success("Highlight uploaded successfully!");

      setOpen(false);
      setFile(null);
      setTitle("");
      setPlayType("StepBack");
      setFormCourtId("");
      setDescription("");
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
        error?.message ||
        "Failed to upload highlight. Please try again."
      );
    }
  };

  const filteredHighlights = useMemo(() => {
    return rawHighlights.filter((item) => {
      const matchesType =
        selectedPlayType === "All" ||
        item.playType.toLowerCase() === selectedPlayType.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.court?.name &&
          item.court.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.uploader?.userName &&
          item.uploader.userName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()));
      return matchesType && matchesSearch;
    });
  }, [rawHighlights, selectedPlayType, searchQuery]);

  return (
    <div className="py-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-title">Highlights</h1>
            {isHighlightsFetching && (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            )}
          </div>
          <p className="text-sm text-description mt-1">
            {rawHighlights.length} highlight clip
            {rawHighlights.length !== 1 ? "s" : ""} available
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FBA30F] to-[#D25A00] px-6 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90 shadow-md"
        >
          <Plus size={18} />
          Add Highlight
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Play Type Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shrink">
          {PLAY_TYPES.map((type) => {
            const isActive = selectedPlayType === type;
            return (
              <button
                key={type}
                onClick={() => setSelectedPlayType(type)}
                className={`shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-black"
                    : "bg-[#1f232b] text-description hover:bg-[#282d38] hover:text-white"
                }`}
              >
                {type === "All"
                  ? "All"
                  : PLAY_TYPE_OPTIONS.find((opt) => opt.value === type)?.label ||
                    type}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          {/* Court Filter */}
          <div className="relative w-full sm:w-44 md:w-48 shrink-0">
            <select
              value={selectedCourtId}
              onChange={(e) => setSelectedCourtId(e.target.value)}
              className="w-full truncate rounded-xl border border-white/10 bg-[#16181e] py-2 px-3 text-sm text-title outline-none focus:border-primary"
            >
              <option value="" className="bg-[#16181e] text-title">All Courts</option>
              {courts.map((court: any) => (
                <option key={court.id} value={court.id} className="bg-[#16181e] text-title">
                  {court.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-60 md:w-64 shrink-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-description" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search highlights..."
              className="w-full rounded-xl border border-white/10 bg-[#16181e] py-2 pl-9 pr-4 text-sm text-title outline-none placeholder:text-description focus:border-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-description hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Highlights Grid */}
      <AllHighlights
        highlights={filteredHighlights}
        isLoading={isHighlightsLoading}
      />

      {/* Upload Modal */}
      <CustomModal
        open={open}
        onClose={() => !isUploading && setOpen(false)}
        title={undefined}
        maxWidth="3xl"
        showCloseButton={false}
      >
        <div className="relative space-y-4 rounded-2xl bg-[#202228] p-6 text-white">
          <button
            type="button"
            disabled={isUploading}
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 disabled:opacity-50"
            aria-label="Close upload modal"
          >
            <X size={20} />
          </button>

          <h2 className="text-2xl font-bold text-title text-center pb-2">
            Upload Highlight
          </h2>

          {/* Video Dropzone */}
          <div className="rounded-xl border-2 border-dashed border-white/15 bg-black/20 p-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Video size={24} />
            </div>
            <div className="text-base font-medium text-title">
              Upload video clip
            </div>
            <div className="mt-1 text-xs text-description">
              MP4, MOV, WebM up to 100MB
            </div>

            <div className="mt-4">
              <label className="inline-block rounded-xl bg-[#2b2419] px-5 py-2.5 text-sm font-semibold cursor-pointer border border-primary/40 text-primary transition-colors hover:bg-primary hover:text-black">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isUploading}
                />
                Choose video file
              </label>

              {previewUrl ? (
                <div className="mt-4">
                  <video
                    src={previewUrl}
                    controls
                    className="mx-auto max-h-52 w-full rounded-lg bg-black object-contain"
                  />
                  <p className="mt-2 text-xs text-emerald-400">
                    Selected: {file?.name}
                  </p>
                </div>
              ) : file ? (
                <p className="mt-2 text-xs text-emerald-400">
                  Selected: {file.name}
                </p>
              ) : null}
            </div>
          </div>

          {/* Form Fields */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-title">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Crazy crossover and step-back 3"
              disabled={isUploading}
              className="w-full rounded-xl border border-white/10 bg-[#16181e] px-4 py-2.5 text-sm text-title outline-none focus:border-primary disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-title">
                Play Type <span className="text-red-400">*</span>
              </label>
              <select
                value={playType}
                onChange={(e) => setPlayType(e.target.value)}
                disabled={isUploading}
                className="w-full rounded-xl border border-white/10 bg-[#16181e] px-3 py-2.5 text-sm text-title outline-none focus:border-primary disabled:opacity-50"
              >
                {PLAY_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-title">
                Court (optional)
              </label>
              <select
                value={formCourtId}
                onChange={(e) => setFormCourtId(e.target.value)}
                disabled={isUploading || isCourtsLoading}
                className="w-full rounded-xl border border-white/10 bg-[#16181e] px-3 py-2.5 text-sm text-title outline-none focus:border-primary disabled:opacity-50"
              >
                <option value="">Select a court (optional)</option>
                {courts.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-title">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              disabled={isUploading}
              placeholder="Tell the story of this play..."
              className="w-full rounded-xl border border-white/10 bg-[#16181e] px-4 py-2.5 text-sm text-title outline-none focus:border-primary resize-none disabled:opacity-50"
            />
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-semibold text-black transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Uploading Highlight...</span>
                </>
              ) : (
                <span>Upload Highlight</span>
              )}
            </button>
          </div>
        </div>
      </CustomModal>
    </div>
  );
}


