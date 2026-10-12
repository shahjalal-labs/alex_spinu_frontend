import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";
import Cookies from "js-cookie";

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL_LOCAL,
    prepareHeaders: (headers, { getState }) => {
      // 1. Try the Redux store first (persisted via redux-persist → always available after login)
      const storeToken = (getState() as RootState).auth?.token;

      // 2. Fall back to cookie (set explicitly on login)
      const cookieToken = Cookies.get("token");

      const token = storeToken || cookieToken;

      if (token) {
        // Backend verifies token directly with jwt.verify(authorization, secret) without stripping "Bearer "
        const cleanToken = token.startsWith("Bearer ")
          ? token.slice(7).trim()
          : token;
        headers.set("authorization", cleanToken);
      }

      return headers;
    },
  }),
  endpoints: () => ({}),
  tagTypes: [
    "Auth",
    "User",
    "service",
    "dashboard",
    "user",
    "quote",
    "coupon",
    "event",
    "discount",
    "Courts",
    "Game",
    "Checkin",
    "Highlight"
  ],
});

export default baseApi;
