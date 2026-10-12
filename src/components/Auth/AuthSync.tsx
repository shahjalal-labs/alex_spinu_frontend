"use client";

import { useGoogleLoginMutation } from "@/redux/api/authApi";
import { setUser } from "@/redux/ReduxFunction";
import {
  DEFAULT_POST_LOGIN_PATH,
  getSafeRedirectPath,
  POST_LOGIN_REDIRECT_KEY,
} from "@/lib/utils";
import Cookies from "js-cookie";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

export const AuthSync = () => {
  const { data: session, status } = useSession();
  const [storeUser] = useGoogleLoginMutation();
  const router = useRouter();
  const dispatch = useDispatch();

  const [isStoringUser, setIsStoringUser] = useState(false);

  useEffect(() => {
    const syncUserToken = async () => {
      const isGoogleSignIn = localStorage.getItem("googleSignIn");

      if (status === "authenticated" && session?.user && isGoogleSignIn) {
        // Where the user was headed before we sent them to login (set in Login.tsx)
        const redirectTo = getSafeRedirectPath(
          localStorage.getItem(POST_LOGIN_REDIRECT_KEY),
          DEFAULT_POST_LOGIN_PATH
        );

        // Clear flag immediately to prevent duplicate runs
        localStorage.removeItem("googleSignIn");
        localStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
        setIsStoringUser(true);

        const name = session.user.name ?? "";
        const email = session.user.email ?? "";
        const profileImage = session.user.image ?? "";

        try {
          const response = await storeUser({
            userName: name,
            email: email,
            profileImage: profileImage,
          }).unwrap();

          if (response?.result?.accessToken) {
            const accessToken = response.result.accessToken;

            // 1. Set cookie with 7-day expiry
            Cookies.set("token", accessToken, { expires: 7 });

            // 2. Update Redux BEFORE navigating
            dispatch(
              setUser({
                role: response.result.role,
                token: accessToken,
                email: email,
                me: response.result,
              })
            );

            toast.success("Google login synced successfully!");

            // 3. Navigate after state is ready
            router.push(redirectTo);
          }
        } catch (error: any) {
          console.error("❌ Failed to sync token:", error);
          toast.error(error?.data?.message || "Failed to sync Google account!");
        } finally {
          setIsStoringUser(false);
        }
      }
    };

    syncUserToken();
  }, [status, session, storeUser, router, dispatch]);

  return (
    <>
      {isStoringUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin"></div>
            <p className="text-gray-800 text-lg font-medium animate-pulse">
              Syncing your account...
            </p>
            <p className="text-gray-500 text-sm">
              Please wait a moment while we get things ready
            </p>
          </div>
        </div>
      )}
    </>
  );
};
