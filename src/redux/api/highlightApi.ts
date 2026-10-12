import baseApi from "./baseApi";

export interface HighlightUploader {
  id: string;
  userName?: string;
  name?: string;
  profileImage?: string | null;
}

export interface HighlightCourt {
  id?: string;
  name: string;
  address?: string;
}

export interface HighlightItem {
  id: string;
  title: string;
  description?: string;
  playType: string;
  mediaUrl: string;
  thumbnailUrl?: string | null;
  durationSeconds?: number | null;
  views: number;
  likes: number;
  courtId?: string | null;
  uploaderId?: string | null;
  gameId?: string | null;
  uploader?: HighlightUploader;
  court?: HighlightCourt;
  createdAt?: string;
  updatedAt?: string;
}

export interface HighlightsResponse {
  success: boolean;
  statusCode?: number;
  message: string;
  data?: {
    highlights: HighlightItem[];
    total: number;
    page: number;
    limit: number;
  };
  result?: {
    highlights: HighlightItem[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface SingleHighlightResponse {
  success: boolean;
  statusCode?: number;
  message: string;
  data?: HighlightItem;
  result?: HighlightItem;
}

export interface DeleteHighlightResponse {
  success: boolean;
  statusCode?: number;
  message: string;
}

export interface UploadHighlightResponse {
  success: boolean;
  statusCode?: number;
  message: string;
  data?: HighlightItem;
  result?: HighlightItem;
}

export interface HighlightsQueryParams {
  courtId?: string;
  page?: number;
  limit?: number;
}

const highlightApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // GET /highlights?courtId={{courtId}}&page=1&limit=20
    getHighlights: builder.query<HighlightsResponse, HighlightsQueryParams | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.courtId) searchParams.set("courtId", params.courtId);
        if (params?.page) searchParams.set("page", String(params.page));
        if (params?.limit) searchParams.set("limit", String(params.limit));

        const qs = searchParams.toString();
        return {
          url: `/highlights${qs ? `?${qs}` : ""}`,
          method: "GET",
        };
      },
      providesTags: ["Highlight"],
    }),

    // GET /highlights/{{highlightId}}
    getHighlightById: builder.query<SingleHighlightResponse, string>({
      query: (highlightId) => ({
        url: `/highlights/${highlightId}`,
        method: "GET",
      }),
      providesTags: (_result, _err, id) => [{ type: "Highlight", id }],
    }),

    // POST /highlights/upload-highlight (FormData: video file + data JSON)
    uploadHighlight: builder.mutation<UploadHighlightResponse, FormData>({
      query: (formData) => ({
        url: "/highlights/upload-highlight",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Highlight"],
    }),

    // DELETE /highlights/{{highlightId}}
    deleteHighlight: builder.mutation<DeleteHighlightResponse, string>({
      query: (highlightId) => ({
        url: `/highlights/${highlightId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Highlight"],
    }),
  }),
});

export const {
  useGetHighlightsQuery,
  useGetHighlightByIdQuery,
  useUploadHighlightMutation,
  useDeleteHighlightMutation,
} = highlightApi;

export default highlightApi;
