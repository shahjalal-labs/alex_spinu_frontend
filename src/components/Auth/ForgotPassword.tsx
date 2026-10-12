"use client";

import type React from "react";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useForgotPasswordMutation } from "@/redux/api/authApi";
import Link from "next/link";
import { toast } from "sonner";
import AuthLayout from "./AuthLayout";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [forgotPassowordFn] = useForgotPasswordMutation();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter a valid email");
      return;
    }

    setIsLoading(true);
    try {
      const response = await forgotPassowordFn({ email }).unwrap();

      if (response?.success) {
        toast.success("Email verification code sent successfully");
        router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
      } else {
        toast.error("Failed to send verification code");
      }
    } catch (error: any) {
      toast.error(
        error?.data?.message || "Something went wrong. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="">
      <h2 className="text-center bg-gradient-to-r from-[#FF6D2B] to-[#FBA30F] bg-clip-text text-transparent font-semibold  text-3xl md:text-5xl mb-6">
        HOOPERS ELITE
      </h2>
      <div className=" flex items-center justify-center  px-4 md:mt-16">
        <div className="w-full max-w-xl bg-card rounded-xl shadow-lg p-8 space-y-5">
          {/* Title */}
          <h2 className="text-3xl font-bold  mb-2 text-title">
            Forgot password
          </h2>

          <form onSubmit={handleForgotPassword}>
            {/* Email */}
            <div className="mb-4 space-y-2">
              <label
                htmlFor="email"
                className="block text-lg font-medium text-description mb-1"
              >
                Email Address
              </label>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full px-2 py-2 border border-gray-300 bg-transparent focus:outline-none focus:border-primary rounded-xl"
              />
            </div>

            <p className="text-base text-description">
              Remember the password ?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Log in{" "}
              </Link>
            </p>
            {/* Send Code Button */}
            <button
              type="submit"
              className="w-full bg-primary text-black py-2 rounded-xl mt-4 hover:bg-primary/90 transition"
            >
              Send Code
            </button>
          </form>
        </div>
      </div>
    </AuthLayout>
  );
}
