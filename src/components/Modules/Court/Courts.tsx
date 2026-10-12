"use client";

import ball from "@/assets/dashboard/basketball-hoop.png";
import filter from "@/assets/dashboard/filter-horizontal.png";
import distanceIcon from "@/assets/dashboard/location.png";
import mapImage from "@/assets/dashboard/map.png";
import { calculateDistanceInMiles } from "@/lib/utils";
import {
  Court,
  useCreateCourtMutation,
  useGetCourtsQuery,
} from "@/redux/api/courtsApi";
import { ExternalLink, ImageIcon, Plus, Search, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GoDotFill } from "react-icons/go";
import { LiaMapSolid, LiaTableSolid } from "react-icons/lia";
import { toast } from "sonner";
import Map, { Pin } from "../Map";
import AllCourts from "./AllCourts";

type ViewMode = "list" | "grid";

type PopupPin = {
  id: number | string;
  left: string;
  top: string;
  title: string;
  address: string;
  url: string;
  positionBelow?: boolean;
};

const FALLBACK_POSITIONS: Record<number, { left: string; top: string }> = {
  0: { left: "12%", top: "24%" },
  1: { left: "28%", top: "10%" },
  2: { left: "43%", top: "33%" },
  3: { left: "52%", top: "20%" },
  4: { left: "59%", top: "41%" },
  5: { left: "65%", top: "29%" },
  6: { left: "71%", top: "57%" },
  7: { left: "84%", top: "17%" },
  8: { left: "88%", top: "78%" },
  9: { left: "44%", top: "59%" },
  10: { left: "53%", top: "66%" },
  11: { left: "61%", top: "71%" },
  12: { left: "14%", top: "85%" },
};

interface AddCourtFormData {
  courtName: string;
  address: string;
  zipCode: string;
  admissionFee: string;
  type: string;
  surface: string;
  hoops: string;
  nightLight: boolean;
  amenities: Record<string, boolean>;
}

// Applied filter state (only applied when user clicks Apply)
interface AppliedFilters {
  courtType: string;
  lighting: string;
  admission: string;
  radius: number | null;
  amenities: Record<string, boolean>;
}

// Load Google Maps API script (and specifically the Places library).
// Important: another component on this page (e.g. <Map />) may load the
// Google Maps script independently, possibly without libraries=places.
// Whichever script wins the race sets window.google.maps first, so we
// cannot just check "does google.maps exist" — we must confirm
// google.maps.places is actually present, and lazy-load it via
// importLibrary() if core maps loaded without it.
const ensurePlacesLibrary = (w: any): Promise<void> => {
  if (w.google?.maps?.places) {
    return Promise.resolve();
  }
  if (w.google?.maps?.importLibrary) {
    return w.google.maps.importLibrary("places").then(() => undefined);
  }
  return Promise.reject(
    new Error("Google Maps loaded without the Places library")
  );
};

const loadGoogleMapsScript = (apiKey: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Window is undefined"));
      return;
    }

    const w = window as any;

    // Core maps already loaded somewhere (by this component or another
    // one on the page) — just make sure Places is loaded too.
    if (w.google?.maps) {
      ensurePlacesLibrary(w).then(resolve).catch(reject);
      return;
    }

    // A script tag is already in the DOM (e.g. added by another
    // component or a previous mount) but hasn't finished loading yet.
    const existingScript = document.querySelector(
      `script[src*="maps.googleapis.com/maps/api/js"]`
    );
    if (existingScript) {
      existingScript.addEventListener("load", () => {
        ensurePlacesLibrary(w).then(resolve).catch(reject);
      });
      existingScript.addEventListener("error", () =>
        reject(new Error("Failed to load Google Maps"))
      );
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", () => {
      ensurePlacesLibrary(w).then(resolve).catch(reject);
    });
    script.addEventListener("error", () => reject(new Error("Failed to load Google Maps")));
    document.head.appendChild(script);
  });
};

// Helper to safely get courts from response
const getCourtsFromResponse = (data: any): Court[] => {
  return data?.result?.courts ?? data?.data?.courts ?? [];
};

// Helper to safely get total from response
const getTotalFromResponse = (data: any): number => {
  return data?.result?.total ?? data?.data?.total ?? 0;
};

// Convert miles to meters (1 mile = 1609.34 meters)
const milesToMeters = (miles: number): number => {
  return Math.round(miles * 1609.34);
};

export default function Courts() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [query, setQuery] = useState("");
  const [selectedPin, setSelectedPin] = useState<PopupPin | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [addCourtOpen, setAddCourtOpen] = useState(false);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);

  // User Current Location State
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Pending filter values (while panel is open)
  const [courtType, setCourtType] = useState("all");
  const [lighting, setLighting] = useState("any");
  const [admission, setAdmission] = useState("any");
  const [radius, setRadius] = useState<number | null>(null);
  const [amenities, setAmenities] = useState<Record<string, boolean>>({
    Parking: false,
    Restrooms: false,
    "Water Fountain": false,
    Benches: false,
    Shade: false,
    "Changing Rooms": false,
  });

  // Applied filters that drive the API query & distance calculations
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>({
    courtType: "all",
    lighting: "any",
    admission: "any",
    radius: null,
    amenities: {
      Parking: false,
      Restrooms: false,
      "Water Fountain": false,
      Benches: false,
      Shade: false,
      "Changing Rooms": false,
    },
  });

  const [addCourtForm, setAddCourtForm] = useState<AddCourtFormData>({
    courtName: "",
    address: "",
    zipCode: "",
    admissionFee: "",
    type: "Outdoor",
    surface: "Asphalt",
    hoops: "2",
    nightLight: false,
    amenities: {
      Parking: false,
      Restrooms: false,
      "Water Fountain": false,
      Benches: false,
      Shade: false,
      "Changing Rooms": false,
    },
  });

  const [courtPhotos, setCourtPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [courtCoords, setCourtCoords] = useState<{ lat: number; lng: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<any>(null);

  const [createCourt, { isLoading: isCreatingCourt }] = useCreateCourtMutation();

  // Load Google Maps
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn("Google Maps API key not found");
      return;
    }

    loadGoogleMapsScript(apiKey)
      .then(() => {
        setGoogleMapsLoaded(true);
      })
      .catch((error) => {
        console.error("Failed to load Google Maps:", error);
      });
  }, []);

  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (!googleMapsLoaded || !addCourtOpen) return;

    const input = document.getElementById("address-input") as HTMLInputElement;
    if (!input) return;

    if (!(window as any).google?.maps?.places?.Autocomplete) {
      console.warn("Google Places library not ready yet; skipping autocomplete init");
      return;
    }

    try {
      const autocomplete = new (window as any).google.maps.places.Autocomplete(input, {
        types: ["address"],
        componentRestrictions: { country: "us" },
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) {
          return;
        }

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const formattedAddress = place.formatted_address || input.value;

        // Find zip code
        let zipCode = "";
        if (place.address_components) {
          const zipComponent = place.address_components.find((comp: any) =>
            comp.types.includes("postal_code")
          );
          if (zipComponent) {
            zipCode = zipComponent.long_name;
          }
        }

        setCourtCoords({ lat, lng });
        setAddCourtForm((prev) => ({
          ...prev,
          address: formattedAddress,
          zipCode: zipCode || prev.zipCode,
        }));
      });

      autocompleteRef.current = autocomplete;
    } catch (error) {
      console.error("Error initializing autocomplete:", error);
    }

    return () => {
      if (autocompleteRef.current) {
        (window as any).google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [googleMapsLoaded, addCourtOpen]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setCourtPhotos((prev) => [...prev, ...filesArray]);
      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setPhotoPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removePhoto = (index: number) => {
    setCourtPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateCourt = async () => {
    if (!addCourtForm.courtName.trim()) {
      toast.error("Please enter a court name");
      return;
    }
    if (!addCourtForm.address.trim()) {
      toast.error("Please enter an address");
      return;
    }
    if (!addCourtForm.zipCode.trim()) {
      toast.error("Please enter a zip code");
      return;
    }
    if (courtPhotos.length === 0) {
      toast.error("Please upload at least one court photo");
      return;
    }
    if (!courtCoords) {
      toast.error("Please select a valid address from the dropdown");
      return;
    }

    const selectedAmenities = Object.keys(addCourtForm.amenities).filter(
      (k) => addCourtForm.amenities[k]
    );

    const bodyData = {
      name: addCourtForm.courtName.trim(),
      address: addCourtForm.address.trim(),
      zipCode: addCourtForm.zipCode.trim(),
      latitude: courtCoords.lat,
      longitude: courtCoords.lng,
      courtType: addCourtForm.type || "Outdoor",
      surface: addCourtForm.surface || "Asphalt",
      numberOfHoops: Number(addCourtForm.hoops) || 2,
      hasNightLight: Boolean(addCourtForm.nightLight),
      admissionFee: Number(addCourtForm.admissionFee) || 0,
      amenities: selectedAmenities,
    };

    const formData = new FormData();
    formData.append("bodyData", JSON.stringify(bodyData));
    formData.append("data", JSON.stringify(bodyData));

    courtPhotos.forEach((file) => {
      formData.append("photos", file);
    });

    try {
      await createCourt(formData).unwrap();
      toast.success("Court created successfully!");
      setAddCourtOpen(false);
      setAddCourtForm({
        courtName: "",
        address: "",
        zipCode: "",
        admissionFee: "",
        type: "Outdoor",
        surface: "Asphalt",
        hoops: "2",
        nightLight: false,
        amenities: {
          Parking: false,
          Restrooms: false,
          "Water Fountain": false,
          Benches: false,
          Shade: false,
          "Changing Rooms": false,
        },
      });
      setCourtPhotos([]);
      setPhotoPreviews([]);
      setCourtCoords(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create court");
    }
  };

  // Detect Current Location
  const detectLocation = useCallback(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // ignore or fallback quietly
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    }
  }, []);

  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

  // Build API query params with filters
  const getApiQueryParams = useMemo(() => {
    const params: any = {
      limit: 2000,
      page: 1,
    };

    // Search query
    if (query.trim()) {
      params.search = query.trim();
    }

    // Court type filter
    if (appliedFilters.courtType && appliedFilters.courtType !== "all") {
      params.courtType = appliedFilters.courtType;
    }

    // Lighting filter
    if (appliedFilters.lighting === "yes") {
      params.hasNightLight = true;
    } else if (appliedFilters.lighting === "no") {
      params.hasNightLight = false;
    }

    // Amenities filter - pass as comma-separated string
    const selectedAmenities = Object.keys(appliedFilters.amenities || {}).filter(
      (k) => appliedFilters.amenities?.[k]
    );
    if (selectedAmenities.length > 0) {
      params.amenities = selectedAmenities.join(",");
    }

    // Distance filter with user location
    if (appliedFilters.radius && userLocation) {
      params.distance = milesToMeters(appliedFilters.radius);
      params.latitude = userLocation.lat;
      params.longitude = userLocation.lng;
    }

    return params;
  }, [query, appliedFilters, userLocation]);

  // Fetch courts from API with filters
  const { data: courtsData, isFetching } = useGetCourtsQuery(getApiQueryParams);

  // Wrap rawCourts in useMemo to avoid dependency issues
  const rawCourts = useMemo(() => {
    return getCourtsFromResponse(courtsData);
  }, [courtsData]);

  const totalCourts = useMemo(() => {
    const total = getTotalFromResponse(courtsData);
    return total > 0 ? total : rawCourts.length;
  }, [courtsData, rawCourts]);

  const activeCourts = useMemo(() => {
    return rawCourts.filter(
      (c) => c.status === "Active" || !c.status
    ).length;
  }, [rawCourts]);

  // Filter courts locally for additional client-side filtering
  const filteredCourts = useMemo(() => {
    // Additional local filtering for admission (since API might not support it)
    // and any other client-side only filters
    return rawCourts
      .filter((court) => {
        // Admission filter: 0 / free = Free, > 0 = Paid
        const fee =
          typeof court.admissionFee === "number"
            ? court.admissionFee
            : parseFloat(String(court.admissionFee ?? "").replace(/[^0-9.]/g, "")) || 0;

        if (appliedFilters.admission === "free") {
          if (fee > 0) return false;
        } else if (appliedFilters.admission === "paid") {
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
      .slice(0, 50);
  }, [rawCourts, userLocation, appliedFilters.admission]);

  // Build map pins
  const PINS: Pin[] = useMemo(
    () =>
      filteredCourts.map((court, idx) => ({
        id: court.id || idx,
        lat: court.latitude,
        lng: court.longitude,
        title: court.name,
        address: court.address,
        url: `/all-court/${court.id}`,
      })),
    [filteredCourts]
  );

  const mapCenter = useMemo(() => {
    if (userLocation) {
      return userLocation;
    }
    if (filteredCourts.length > 0) {
      return {
        lat: filteredCourts[0].latitude,
        lng: filteredCourts[0].longitude,
      };
    }
    return { lat: 26.22, lng: -98.25 };
  }, [userLocation, filteredCourts]);

  const visiblePins = useMemo(() => {
    if (!query.trim()) return PINS;
    const normalized = query.trim().toLowerCase();
    return PINS.filter(
      (pin) =>
        pin.title?.toLowerCase().includes(normalized) ||
        pin.address?.toLowerCase().includes(normalized)
    );
  }, [query, PINS]);

  // Pin for the live "Add Court" address preview map
  const addCourtPreviewPin: Pin[] = useMemo(() => {
    if (!courtCoords) return [];
    return [
      {
        id: "new-court-preview",
        lat: courtCoords.lat,
        lng: courtCoords.lng,
        title: addCourtForm.courtName || "Selected location",
        address: addCourtForm.address,
        url: "#",
      },
    ];
  }, [courtCoords, addCourtForm.courtName, addCourtForm.address]);

  return (
    <section className="w-full text-title my-6">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold leading-none">Find Courts</h1>
          <div className="mt-2 flex h-6 items-center gap-3 text-base text-description">
            {isFetching ? (
              <span className="flex items-center gap-2">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
                Loading...
              </span>
            ) : (
              <>
                <span className="text-primary">{totalCourts} courts</span>
                <div>
                  <GoDotFill />
                </div>
                <span className="text-emerald-400">{activeCourts} active</span>
              </>
            )}
          </div>
        </div>
        <div>
          <button
            type="button"
            onClick={() => setAddCourtOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#FBA30F] to-[#D25A00] px-4 py-2 text-base font-medium transition-colors hover:brightness-110 text-white"
          >
            <Plus /> Add Court
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-description" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search Court"
            className="h-11 w-full rounded-xl border border-primary/30 bg-transparent pl-10 pr-4 text-base text-title outline-none transition-colors placeholder:text-description focus:border-primary"
          />
        </div>

        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-primary/30 px-4 text-base text-title transition-colors hover:border-primary hover:text-primary"
        >
          <Image src={filter} alt="Filter" width={20} height={20} />
          Filter
        </button>

        <div className="inline-flex h-11 items-center gap-1 rounded-xl border border-primary/30 p-1">
          <button
            onClick={() => setViewMode("list")}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
              viewMode === "list"
                ? "bg-primary text-black"
                : "text-description hover:text-title"
            }`}
            aria-label="List view"
          >
            <LiaMapSolid size={30} />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
              viewMode === "grid"
                ? "bg-primary text-black"
                : "text-description hover:text-title"
            }`}
            aria-label="Grid view"
          >
            <LiaTableSolid size={30} />
          </button>
        </div>
      </div>

      {viewMode === "grid" ? (
        <AllCourts
          query={query}
          courtType={appliedFilters.courtType}
          lighting={appliedFilters.lighting}
          admission={appliedFilters.admission}
          userLocation={userLocation}
          radius={appliedFilters.radius ?? undefined}
          amenities={appliedFilters.amenities}
        />
      ) : process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
        <Map pins={visiblePins} center={mapCenter} zoom={10} />
      ) : (
        <div
          className="relative h-[400px] md:min-h-[770px] overflow-hidden rounded-2xl border border-white/10"
          onClick={() => setSelectedPin(null)}
          style={{
            backgroundImage: `url(${mapImage.src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {visiblePins.map((pin, idx) => {
            const pos = FALLBACK_POSITIONS[idx % 13] || {
              left: `${10 + (idx % 10) * 7}%`,
              top: `${15 + (idx % 7) * 9}%`,
            };
            return (
              <button
                key={pin.id}
                className="group absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: pos.left, top: pos.top }}
                aria-label={`Court pin ${pin.id}`}
                onClick={(event) => {
                  event.stopPropagation();
                  const topValue = parseFloat(pos.top);
                  const positionBelow = topValue < 30;
                  setSelectedPin({
                    id: pin.id,
                    left: pos.left,
                    top: pos.top,
                    title: pin.title || "Court",
                    address: pin.address || "",
                    url: pin.url || `/all-court/${pin.id}`,
                    positionBelow,
                  });
                }}
              >
                <div className="relative flex items-center justify-center">
                  <span className="relative flex items-center justify-center rounded-full transition-transform group-hover:scale-110 w-16 h-16 md:w-23 md:h-23">
                    <Image
                      src={ball}
                      alt="Court Pin"
                      fill
                      className="drop-shadow-[0_5px_10px_rgba(251,163,15,0.9)]"
                    />
                  </span>
                </div>
              </button>
            );
          })}

          {selectedPin && (
            <div
              className={`fixed sm:absolute w-[calc(90vw-32px)] sm:w-[280px] left-1/2 sm:left-[var(--pin-left)] top-1/2 sm:top-[var(--pin-top)] -translate-x-1/2 sm:translate-x-0 ${
                selectedPin.positionBelow
                  ? "-translate-y-1/2 sm:translate-y-[20%]"
                  : "-translate-y-1/2 sm:-translate-y-[120%]"
              } z-50 rounded-2xl bg-[#111111] border border-[#FBA30F]/35 p-5 shadow-[0_20px_45px_rgba(0,0,0,0.9),0_0_25px_rgba(251,163,15,0.22)]`}
              style={
                {
                  "--pin-left": selectedPin.left,
                  "--pin-top": selectedPin.top,
                } as any
              }
              onClick={(event) => event.stopPropagation()}
            >
              <button
                onClick={() => setSelectedPin(null)}
                className="absolute right-3 top-3 text-[#9ca3af] transition-colors hover:text-white"
                aria-label="Close popup"
              >
                <X size={18} />
              </button>

              <div className="mb-3 flex justify-center">
                <div className="relative w-12 h-12 flex items-center justify-center drop-shadow-[0_0_10px_rgba(251,163,15,0.7)]">
                  <Image
                    src={ball}
                    alt="Court"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              <div className="text-center">
                <p className="mb-1 text-lg font-bold leading-tight text-white">
                  {selectedPin.title}
                </p>
                <p className="mb-4 text-xs text-[#9ca3af] leading-normal">
                  {selectedPin.address}
                </p>

                <a
                  href={selectedPin.url}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FBA30F] to-[#D25A00] hover:opacity-90 px-4 py-3 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(251,163,15,0.4)] transition-opacity"
                >
                  <span>View Court</span>
                  <ExternalLink size={15} />
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter Modal */}
      {filterOpen && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-end bg-black/40"
          onClick={() => setFilterOpen(false)}
        >
          <div
            className="w-[606px] max-w-full bg-card h-full overflow-auto p-6 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-end">
                <button
                  onClick={() => setFilterOpen(false)}
                  className="text-description hover:text-white"
                  aria-label="Close filters"
                >
                  <X />
                </button>
              </div>
              <h2 className="text-2xl font-normal text-center">
                Filter Courts
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-base text-title">
                  Court Type
                </label>
                <select
                  value={courtType}
                  onChange={(e) => setCourtType(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-base text-description"
                >
                  <option value="all">All Types</option>
                  <option value="Indoor">Indoor</option>
                  <option value="Outdoor">Outdoor</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-base text-title">
                  Lighting
                </label>
                <select
                  value={lighting}
                  onChange={(e) => setLighting(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-base text-description"
                >
                  <option value="any">Any</option>
                  <option value="yes">Has Lights</option>
                  <option value="no">No Lights</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-base text-title">
                  Admission
                </label>
                <select
                  value={admission}
                  onChange={(e) => setAdmission(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-base text-description"
                >
                  <option value="any">Any</option>
                  <option value="free">Free Only</option>
                  <option value="paid">Paid Only</option>
                </select>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-base text-title">
                    <Image
                      src={distanceIcon}
                      alt="Distance"
                      width={16}
                      height={16}
                    />
                    <span>Distance Radius</span>
                  </div>
                  <div className="text-base bg-[#FFF7E81A] text-primary/60 rounded px-2 py-1">
                    {radius ? `${radius} miles` : "50 miles"}
                  </div>
                </div>

                <input
                  type="range"
                  min={5}
                  max={100}
                  value={radius ?? 50}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="w-full"
                />
                <div className="mt-2 flex items-center justify-between text-base text-description">
                  <span>5 mi</span>
                  <span>100 mi</span>
                </div>
              </div>

              <div>
                <p className="mb-3 text-lg text-title">Amenities</p>
                <div className="grid grid-cols-2 gap-2 text-base">
                  {Object.keys(amenities).map((key) => (
                    <label key={key} className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={amenities[key]}
                        onChange={() =>
                          setAmenities({ ...amenities, [key]: !amenities[key] })
                        }
                        className="h-4 w-4 rounded border bg-transparent"
                      />
                      <span className="text-description">{key}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => {
                    setAppliedFilters({
                      courtType,
                      lighting,
                      admission,
                      radius,
                      amenities: { ...amenities },
                    });
                    setFilterOpen(false);
                  }}
                  className="w-full rounded-xl bg-primary hover:bg-primary/90 py-3 text-base font-medium text-black"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Court Modal */}
      {addCourtOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setAddCourtOpen(false)}
        >
          <div
            className="court-scrollbar max-h-[calc(90vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl bg-card p-6 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Add New Court</h2>
              <button
                onClick={() => setAddCourtOpen(false)}
                className="text-description hover:text-white"
              >
                <X />
              </button>
            </div>

            <div className="space-y-4">
              {/* Court Name */}
              <div>
                <label className="mb-2 block text-base font-medium text-title">
                  Court Name<span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  value={addCourtForm.courtName}
                  onChange={(e) =>
                    setAddCourtForm({
                      ...addCourtForm,
                      courtName: e.target.value,
                    })
                  }
                  placeholder="Court name"
                  className="w-full rounded-lg border border-white/10 bg-transparent px-4 py-3 text-base text-title outline-none transition-colors placeholder:text-description focus:border-primary"
                />
              </div>

              {/* Address with Google Places Autocomplete */}
              <div>
                <label className="mb-2 block text-base font-medium text-title">
                  Address<span className="text-primary">*</span>
                </label>
                <input
                  id="address-input"
                  type="text"
                  value={addCourtForm.address}
                  onChange={(e) =>
                    setAddCourtForm({
                      ...addCourtForm,
                      address: e.target.value,
                    })
                  }
                  placeholder="Start typing an address..."
                  className="w-full rounded-lg border border-white/10 bg-transparent px-4 py-3 text-base text-title outline-none transition-colors placeholder:text-description focus:border-primary"
                  disabled={!googleMapsLoaded}
                />
                {!googleMapsLoaded && (
                  <p className="mt-1 text-xs text-yellow-500">
                    Loading Google Maps...
                  </p>
                )}
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs text-description">
                    {courtCoords
                      ? `📍 Coordinates: ${courtCoords.lat.toFixed(6)}, ${courtCoords.lng.toFixed(6)}`
                      : "📍 Select an address from the dropdown"}
                  </p>
                  {courtCoords && (
                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                      <GoDotFill className="text-emerald-400" size={8} />
                      Location found
                    </span>
                  )}
                </div>

                {/* Live map preview of selected address */}
                {courtCoords && process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
                  <div className="mt-3 h-[220px] w-full overflow-hidden rounded-xl border border-white/10">
                    <Map
                      key={`${courtCoords.lat}-${courtCoords.lng}`}
                      pins={addCourtPreviewPin}
                      center={courtCoords}
                      zoom={16}
                    />
                  </div>
                )}
              </div>

              {/* Zip Code */}
              <div>
                <label className="mb-2 block text-base font-medium text-title">
                  Zip Code<span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  value={addCourtForm.zipCode}
                  onChange={(e) =>
                    setAddCourtForm({
                      ...addCourtForm,
                      zipCode: e.target.value,
                    })
                  }
                  placeholder="Zip code"
                  className="w-full rounded-lg border border-white/10 bg-transparent px-4 py-3 text-base text-title outline-none transition-colors placeholder:text-description focus:border-primary"
                />
              </div>

              {/* Type and Surface */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-base font-medium text-title">
                    Type
                  </label>
                  <select
                    value={addCourtForm.type}
                    onChange={(e) =>
                      setAddCourtForm({ ...addCourtForm, type: e.target.value })
                    }
                    className="w-full rounded-lg border border-white/10 bg-[#242424] px-4 py-3 text-base text-title outline-none transition-colors focus:border-primary"
                  >
                    <option value="Outdoor" className="bg-[#242424] text-white">Outdoor</option>
                    <option value="Indoor" className="bg-[#242424] text-white">Indoor</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-base font-medium text-title">
                    Surface
                  </label>
                  <select
                    value={addCourtForm.surface}
                    onChange={(e) =>
                      setAddCourtForm({
                        ...addCourtForm,
                        surface: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-white/10 bg-[#242424] px-4 py-3 text-base text-title outline-none transition-colors focus:border-primary"
                  >
                    <option value="Asphalt" className="bg-[#242424] text-white">Asphalt</option>
                    <option value="Concrete" className="bg-[#242424] text-white">Concrete</option>
                    <option value="Wood" className="bg-[#242424] text-white">Wood</option>
                  </select>
                </div>
              </div>

              {/* No. of Hoops and Night Light */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-base font-medium text-title">
                    No. of Hoops
                  </label>
                  <select
                    value={addCourtForm.hoops}
                    onChange={(e) =>
                      setAddCourtForm({
                        ...addCourtForm,
                        hoops: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-white/10 bg-[#242424] px-4 py-3 text-base text-title outline-none transition-colors focus:border-primary"
                  >
                    <option value="1" className="bg-[#242424] text-white">1</option>
                    <option value="2" className="bg-[#242424] text-white">2</option>
                    <option value="3" className="bg-[#242424] text-white">3</option>
                    <option value="4" className="bg-[#242424] text-white">4</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-base font-medium text-title">
                    Night Light
                  </label>
                  <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-transparent px-4 py-3">
                    <button
                      type="button"
                      aria-pressed={addCourtForm.nightLight}
                      aria-label="Toggle night light"
                      onClick={() =>
                        setAddCourtForm({
                          ...addCourtForm,
                          nightLight: !addCourtForm.nightLight,
                        })
                      }
                      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
                        addCourtForm.nightLight ? "bg-primary" : "bg-white/20"
                      }`}
                    >
                      <span
                        className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                          addCourtForm.nightLight
                            ? "translate-x-5"
                            : "translate-x-0"
                        }`}
                      />
                    </button>
                    <span className="text-base text-description">
                      {addCourtForm.nightLight ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-base font-medium text-title">
                  Admission Fee ($)<span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  value={addCourtForm.admissionFee}
                  onChange={(e) =>
                    setAddCourtForm({
                      ...addCourtForm,
                      admissionFee: e.target.value,
                    })
                  }
                  placeholder="0"
                  className="w-full rounded-lg border border-white/10 bg-transparent px-4 py-3 text-base text-title outline-none transition-colors placeholder:text-description focus:border-primary"
                />
              </div>

              {/* Amenities */}
              <div>
                <p className="mb-3 text-base font-medium text-title">
                  Amenities
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(addCourtForm.amenities).map(
                    ([key, value]) => (
                      <label
                        key={key}
                        className="inline-flex items-center gap-2"
                      >
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={() =>
                            setAddCourtForm({
                              ...addCourtForm,
                              amenities: {
                                ...addCourtForm.amenities,
                                [key]: !value,
                              },
                            })
                          }
                          className="h-4 w-4 rounded border border-white/20 bg-transparent accent-primary"
                        />
                        <span className="text-base text-description">
                          {key}
                        </span>
                      </label>
                    ),
                  )}
                </div>
              </div>

              {/* Court Photos Upload */}
              <div>
                <label className="mb-2 block text-base font-medium text-title">
                  Court Photo<span className="text-primary text-lg">*</span>
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                  onChange={handlePhotoSelect}
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#5b6476] bg-[#242424] px-6 py-6 text-center hover:border-primary transition-colors"
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-white">
                    <ImageIcon className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-xl font-semibold text-white">
                    Upload photo
                  </p>
                  <p className="mt-1 text-sm text-description">jpeg, png, webp</p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="mt-4 rounded-xl border border-primary px-10 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                  >
                    Choose file{courtPhotos.length > 0 ? "s" : ""}
                  </button>
                </div>

                {/* Previews */}
                {photoPreviews.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                    {photoPreviews.map((url, index) => (
                      <div
                        key={index}
                        className="relative aspect-video rounded-lg overflow-hidden border border-white/10 group bg-black"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={`Upload preview ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-1 right-1 p-1 rounded-md bg-black/80 text-white/80 hover:text-red-400 hover:bg-black transition-colors"
                          aria-label="Remove photo"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleCreateCourt}
                  disabled={isCreatingCourt || !courtCoords}
                  className="w-full rounded-xl bg-primary py-3.5 px-4 text-base font-semibold text-black transition-all hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isCreatingCourt ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                      <span>Creating Court...</span>
                    </>
                  ) : (
                    "Add Court"
                  )}
                </button>
                {!courtCoords && addCourtForm.address && (
                  <p className="mt-2 text-xs text-yellow-500 text-center">
                    ⚠️ Please select a valid address from the dropdown suggestions
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}