import baseApi from "./baseApi";

const gameApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // POST /games/create-game
    createGame: builder.mutation({
      query: (data) => ({
        url: `/games/create-game`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Game", "Courts"],
    }),
    getAllGames: builder.query({
      query: ({
        limit,
        page,
        date
      }) => {
        const params = new URLSearchParams();
        
       params.append("limit", String(limit));
        params.append("page", String(page));

       if (date) params.append("date", date);

       return {
          url: `/games?${params.toString()}`,
          method: "GET",
        };
        
      } ,

      providesTags: ["Game"],
    }),

     joinGame: builder.mutation({
      query: (id) => ({
        url: `/games/${id}/join`,
        method: "POST",
      }),
      invalidatesTags: ["Game"],
    }),
     myGames: builder.query({
      query: ({page, limit}) => ({
        url: `/games/my/games?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["Game"],
    }),
     getGameDetails: builder.query({
      query: (id) => ({
        url: `/games/${id}`,
        method: "GET",
      }),
      providesTags: ["Game"],
    }),

    // POST /games/invite-player
    invitePlayer: builder.mutation({
      query: (data) => ({
        url: `/games/invite-player`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Game"],
    }),


  }),
});

export const {
  useCreateGameMutation,
  useGetAllGamesQuery,
  useJoinGameMutation,
  useMyGamesQuery,
  useGetGameDetailsQuery,
  useInvitePlayerMutation
} = gameApi;
