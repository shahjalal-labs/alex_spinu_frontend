import baseApi from "./baseApi";

const checkinApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
   
    checkinGame: builder.mutation({
      query: (data) => ({
        url: `/check-ins/check-in`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Checkin"],
    }),

     getActiveCheckins: builder.query({
      query: (id) => ({
        url: `/check-ins/court/${id}`,
        method: "GET",
      }),
      providesTags: ["Checkin"],
    }),

   
  }),
});

export const {
  useCheckinGameMutation,
  useGetActiveCheckinsQuery
} = checkinApi;
