import baseApi from "./baseApi";

const userApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // POST /users/create-account
    register: builder.mutation({
      query: (data) => ({
        url: `/users/create-account`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    // GET /users/profile  (requires auth)
    getMe: builder.query<any, void>({
      query: () => ({
        url: `/users/profile`,
        method: "GET",
      }),
      providesTags: ["User"],
    }),

    // PATCH /users/update-profile
    updateProfile: builder.mutation({
      query: (data: { userName?: string; city?: string; country?: string }) => ({
        url: `/users/update-profile`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    // PATCH /users/update-profile-image  (FormData with profileImage field)
    updateProfileImage: builder.mutation({
      query: (formData: FormData) => ({
        url: `/users/update-profile-image`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useRegisterMutation,
  useGetMeQuery,
  useUpdateProfileMutation,
  useUpdateProfileImageMutation,
} = userApi;
