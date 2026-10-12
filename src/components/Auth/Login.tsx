"use client";

import type React from "react";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { useLoginMutation } from "@/redux/api/authApi";
import { setUser } from "@/redux/ReduxFunction";
import {
  getSafeRedirectPath,
  POST_LOGIN_REDIRECT_KEY,
} from "@/lib/utils";
import Cookies from "js-cookie";
import Link from "next/link";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import AuthLayout from "./AuthLayout";
import { signIn } from "next-auth/react";

import { FcGoogle } from "react-icons/fc";
import { Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Where to land after login - set by guarded pages as ?redirect=/join-game/123
  const redirectTo = getSafeRedirectPath(searchParams.get("redirect"));

  const [loginFn] = useLoginMutation();
  const dispatch = useDispatch();

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    localStorage.setItem("googleSignIn", "true");
    // The query string is lost across the OAuth round-trip, so stash the
    // destination for AuthSync to pick up when Google sends the user back
    localStorage.setItem(POST_LOGIN_REDIRECT_KEY, redirectTo);

    signIn("google").catch((err) => {
      console.error("Google login error:", err);
      toast.error("Google login failed. Please try again.");
      setGoogleLoading(false);
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = { email: "", password: "" };
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    if (newErrors.email || newErrors.password) return;

    setIsLoading(true);

    try {
      const response = await loginFn({ email, password }).unwrap();
      if (response.success) {
        const accessToken = response?.result?.accessToken;

        // 1. Store the token in a cookie (7-day expiry so it survives refreshes)
        Cookies.set("token", accessToken, { expires: 7 });

        // 2. Update Redux state BEFORE navigating so auth is ready on the next page
        dispatch(
          setUser({
            role: response.result.role,
            token: accessToken,
            email: email,
            me: response.result,
          }),
        );

        toast.success("Login successful");

        // 3. Navigate after state is set (back to the guarded page if we came from one)
        router.push(redirectTo);
      }
    } catch (err: any) {
      const message =
        err?.data?.message || err?.message || "Login failed. Please try again.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <AuthLayout title="" subtitle="">
      <h2 className="text-center bg-gradient-to-r from-[#FF6D2B] to-[#FBA30F] bg-clip-text text-transparent font-semibold  text-3xl md:text-5xl mb-6">
        HOOPERS ELITE
      </h2>
      <div className="flex items-center justify-center px-4 md:mt-16">
        <div className="w-full max-w-3xl bg-card rounded-2xl shadow-lg p-8 space-y-5">
          <h2 className="text-3xl font-bold  mb-6 text-title">Log in</h2>
          <p className="text-base md:text-lg text-description">
            Let’s login into your account first
          </p>

          <form onSubmit={handleLogin}>
            {/* Email */}

            <div className="mb-4 space-y-2">
              <label
                htmlFor="email"
                className="block text-lg font-medium text-title mb-1"
              >
                Email Address
              </label>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setErrors({ ...errors, email: "" });
                }}
                className="w-full px-2 py-2 border border-gray-300 bg-transparent focus:outline-none focus:border-primary text-title rounded-xl"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password with Eye Button */}
            <div className="mb-2 relative  space-y-2">
              <label
                htmlFor="password"
                className="block text-lg font-medium text-title mb-1"
              >
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setErrors({ ...errors, password: "" });
                }}
                className="w-full px-2 py-2 border border-gray-300 bg-transparent focus:outline-none focus:border-primary text-title pr-10 rounded-xl"
              />

              {/* Eye Button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-11 text-title"
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end mb-4">
              <Link
                href="/forgot-password"
                className="text-base  font-normal hover:underline text-primary"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-black py-3 hover:bg-primary/90 transition rounded-xl flex items-center justify-center gap-2 font-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Logging in...
                </>
              ) : (
                "Log in"
              )}
            </button>
          </form>

          {/* OR Separator */}
          <div className="flex items-center gap-4">
            <div className="flex-1 border-t border-gray-700"></div>
            <span className="text-gray-500 text-sm">OR</span>
            <div className="flex-1 border-t border-gray-700"></div>
          </div>

          {/* Continue with Google */}
          <div className="pt-1 flex justify-center items-center">
            <button
              onClick={handleGoogleLogin}
              type="button"
              className="w-full flex items-center justify-center gap-2 border border-gray-700 bg-white hover:bg-white/90 text-black font-medium py-3 px-8 rounded-xl transition"
            >
              <FcGoogle size={30} />
              <span className="flex items-center gap-2">
                {googleLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Redirecting...
                  </>
                ) : (
                  "Continue with Google"
                )}
              </span>
            </button>
          </div>

          <div className="text-center">
            <p className="text-gray-400 text-base">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
