"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { useVerifyOtpMutation } from "@/redux/api/authApi";
import AuthLayout from "./AuthLayout";

const OTP_LENGTH = 4;

export default function VerifyOTP() {
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pastedValue = event.clipboardData
      .getData("text")
      .slice(0, OTP_LENGTH);

    if (!/^[0-9]*$/.test(pastedValue)) return;

    const nextOtp = Array.from(
      { length: OTP_LENGTH },
      (_, index) => pastedValue[index] || "",
    );
    setOtp(nextOtp);

    const focusIndex = Math.min(pastedValue.length, OTP_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const [verifyOtpFn] = useVerifyOtpMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join("");

    if (otpValue.length !== 4 || !email) return;

    setIsLoading(true);
    try {
      const response = await verifyOtpFn({ email, otp: otpValue }).unwrap();
      const accessToken = response?.result?.accessToken;

      localStorage.setItem("reset_token", accessToken);
      console.log(accessToken, "................");

      if (response?.success) {
        toast.success("OTP verified successfully");

        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      } else {
        toast.error("Invalid OTP, please try again.");
      }
    } catch (error: any) {
      toast.error(
        error?.data?.message ?? "Verification failed. Please try again.",
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
      <div className=" flex items-center justify-center px-4 md:mt-16">
        <div className="w-full max-w-3xl bg-card rounded-xl space-y-6 shadow-lg p-8 ">
          <h2 className="text-3xl font-bold mb-2 text-title">Enter OTP</h2>

          <p className="text-base text-description">
            Enter OTP sent to your email{" "}
          </p>
          <form onSubmit={handleSubmit}>
            {/* OTP Inputs */}
            <div className="flex  gap-6 mb-4">
              {[...Array(OTP_LENGTH)].map((_, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  onPaste={handlePaste}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  value={otp[index]}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center border border-gray-300 rounded-full text-lg focus:outline-none focus:border-primary bg-transparent focus:text-primary focus:bg-primary/10"
                />
              ))}
            </div>

            <div className="text-description">
              <p>
                Didn&apos;t receive the code?{" "}
                <span className="text-primary hover:underline cursor-pointer">
                  Resend code
                </span>
              </p>
              <p className="text-base  mt-2">Resend code at 00:59</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-black py-2 rounded-xl hover:bg-primary/90 transition mt-6"
            >
              {isLoading ? "Verifying..." : "Submit"}
            </button>
          </form>
          <p className="text-sm text-description mt-2">
            Can&apos;t find the email? Check your spam folder.
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
