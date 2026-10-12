import baseApi from "./baseApi";

const authApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // POST /auth/login
    login: builder.mutation({
      query: (data) => ({
        url: `/auth/login`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auth"],
    }),

    // POST /users/google-login
    googleLogin: builder.mutation({
      query: (data) => ({
        url: `/users/google-login`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auth"],
    }),

    // POST /auth/send-otp
    forgotPassword: builder.mutation({
      query: (data) => ({
        url: `/auth/send-otp`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auth"],
    }),

    // POST /auth/verify-otp
    verifyOtp: builder.mutation({
      query: (data) => ({
        url: `/auth/verify-otp`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auth"],
    }),

    // PATCH /auth/reset-password
    resetPassword: builder.mutation({
      query: (data) => ({
        url: `/auth/reset-password`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Auth"],
    }),

    // PATCH /auth/change-pass
    changePassword: builder.mutation({
      query: (data) => ({
        url: "/auth/change-password",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Auth"],
    }),
  }),
});

export const {
  useLoginMutation,
  useGoogleLoginMutation,
  useForgotPasswordMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
} = authApi;
