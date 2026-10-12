import baseApi from "./baseApi";

export interface Court {
  id: string;
  googlePlaceId?: string;
  name: string;
  address: string;
  zipCode?: string | null;
  latitude: number;
  longitude: number;
  courtType: string;
  surface: string;
  numberOfHoops?: number | null;
  hasNightLight: boolean;
  admissionFee: number;
  amenities: string[];
  photos: string[];
  avgRating: number;
  status: string;
  addedById?: string | null;
  createdAt?: string;
  updatedAt?: string;
  games?: any[];
  highlights?: any[];
}

export interface CourtsResponse {
  success: boolean;
  statusCode?: number;
  message: string;
  result?: {
    courts: Court[];
    total: number;
    page: number;
    limit: number;
  };
  data?: {
    courts: Court[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface SingleCourtResponse {
  success: boolean;
  statusCode?: number;
  message: string;
  result?: Court;
  data?: Court;
}

export interface CourtsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  courtType?: string;
  hasNightLight?: boolean;
  admissionFee?: number;
  amenities?: string[] | string; // Allow both array and string
  distance?: number;
  latitude?: number;
  longitude?: number;
}

const courtsApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getCourts: builder.query<CourtsResponse, CourtsQueryParams | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.set("page", String(params.page));
        if (params?.limit) searchParams.set("limit", String(params.limit));
        if (params?.search) searchParams.set("search", params.search);
        
        // Handle amenities - can be string or array
        if (params?.amenities) {
          if (Array.isArray(params.amenities)) {
            // If it's an array, join with comma
            if (params.amenities.length > 0) {
              searchParams.set("amenities", params.amenities.join(","));
            }
          } else if (typeof params.amenities === "string" && params.amenities.trim()) {
            // If it's a string, use it directly
            searchParams.set("amenities", params.amenities);
          }
        }
        
        if (params?.distance) searchParams.set("distance", String(params.distance));
        if (params?.latitude) searchParams.set("latitude", String(params.latitude));
        if (params?.longitude) searchParams.set("longitude", String(params.longitude));
        if (params?.courtType && params.courtType !== "all") {
          const typeFormatted =
            params.courtType.charAt(0).toUpperCase() +
            params.courtType.slice(1).toLowerCase();
          if (typeFormatted === "Indoor" || typeFormatted === "Outdoor") {
            searchParams.set("courtType", typeFormatted);
          }
        }
        if (params?.hasNightLight !== undefined)
          searchParams.set("hasNightLight", String(params.hasNightLight));
        if (params?.admissionFee !== undefined)
          searchParams.set("admissionFee", String(params.admissionFee));

        const qs = searchParams.toString();
        return {
          url: `/courts${qs ? `?${qs}` : ""}`,
          method: "GET",
        };
      },
      providesTags: ["Courts"],
    }),

    getCourtById: builder.query<SingleCourtResponse, string>({
      query: (id) => ({
        url: `/courts/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _err, id) => [{ type: "Courts", id }],
    }),

    createCourt: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: "/courts/create-court",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Courts"],
    }),
  }),
});

export const {
  useGetCourtsQuery,
  useGetCourtByIdQuery,
  useCreateCourtMutation,
} = courtsApi;
export default courtsApi;