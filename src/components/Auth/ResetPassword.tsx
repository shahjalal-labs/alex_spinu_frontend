"use client";

import type React from "react";

import { useResetPasswordMutation } from "@/redux/api/authApi";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "sonner";
import AuthLayout from "./AuthLayout";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasLowercase: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecial: false,
  });
  const router = useRouter();

  const [resetPasswordFn] = useResetPasswordMutation();

  const validatePasswordRequirements = (password: string) => {
    const requirements = {
      minLength: password.length >= 8,
      hasLowercase: /[a-z]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%&*]/.test(password),
    };
    setPasswordRequirements(requirements);
    return requirements;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const newErrors = { newPassword: "", confirmPassword: "" };

    if (!newPassword) {
      newErrors.newPassword = "New password is required";
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    }

    setErrors(newErrors);
    if (newErrors.newPassword || newErrors.confirmPassword) {
      return;
    }

    const requirements = validatePasswordRequirements(newPassword);
    if (
      !requirements.minLength ||
      !requirements.hasLowercase ||
      !requirements.hasUppercase ||
      !requirements.hasNumber ||
      !requirements.hasSpecial
    ) {
      setError("Password must meet all requirements");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const accessToken = localStorage.getItem("reset_token");
    console.log(accessToken, "...........................");

    if (!accessToken) {
      setError("Invalid session. Please verify OTP again.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await resetPasswordFn({
        password: newPassword,
        token: accessToken,
      }).unwrap();
      if (response.success) {
        toast.success("Password reset successfully");
        router.push("/login");
      }
    } catch (error: any) {
      toast.error(error?.data?.message ?? "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="">
      <h2 className="text-center bg-gradient-to-r from-[#FF6D2B] to-[#FBA30F] bg-clip-text text-transparent font-semibold text-3xl md:text-5xl mb-6">
        HOOPERS ELITE
      </h2>
      <div className="flex items-center justify-center px-4 md:mt-16">
        <div className="w-full max-w-3xl bg-card rounded-2xl shadow-lg p-8 space-y-5">
          <h2 className="text-2xl md:text-3xl font-bold text-title">
            Input the new password
          </h2>

          <form onSubmit={handleResetPassword}>
            <div className="mb-4 relative">
              <label
                htmlFor="new-password"
                className="block text-lg text-description mb-2"
              >
                New password
              </label>
              <input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                placeholder="New password"
                value={newPassword}
                onChange={(event) => {
                  const value = event.target.value;
                  setNewPassword(value);
                  setErrors({ ...errors, newPassword: "" });
                  validatePasswordRequirements(value);
                }}
                className="w-full px-3 py-2.5 border border-gray-500 rounded-xl bg-transparent focus:outline-none focus:border-primary text-title pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-12 text-description hover:text-title"
              >
                {showNewPassword ? (
                  <FaEyeSlash size={18} />
                ) : (
                  <FaEye size={18} />
                )}
              </button>
              {errors.newPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.newPassword}
                </p>
              )}
            </div>

            <div className="mb-4 relative">
              <label
                htmlFor="confirm-password"
                className="block text-lg text-description mb-2"
              >
                Confirm new password
              </label>
              <input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  setErrors({ ...errors, confirmPassword: "" });
                }}
                className="w-full px-3 py-2.5 border border-gray-500 rounded-xl bg-transparent focus:outline-none focus:border-primary text-title pr-10"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword}
                </p>
              )}
              {error && <p className="mt-4 text-base text-red-400">{error}</p>}

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-12 text-description hover:text-title"
              >
                {showConfirmPassword ? (
                  <FaEyeSlash size={18} />
                ) : (
                  <FaEye size={18} />
                )}
              </button>
            </div>

            <div className="text-description text-base space-y-2 mb-6">
              <p>Password Requirements:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li
                  className={
                    passwordRequirements.minLength
                      ? "text-green-500"
                      : "text-description"
                  }
                >
                  Must be at least 8 characters
                </li>
                <li
                  className={
                    passwordRequirements.hasLowercase
                      ? "text-green-500"
                      : "text-description"
                  }
                >
                  Must include one lowercase letter
                </li>
                <li
                  className={
                    passwordRequirements.hasUppercase
                      ? "text-green-500"
                      : "text-description"
                  }
                >
                  Must include one uppercase letter
                </li>
                <li
                  className={
                    passwordRequirements.hasNumber
                      ? "text-green-500"
                      : "text-description"
                  }
                >
                  Must include at least one number.
                </li>
                <li
                  className={
                    passwordRequirements.hasSpecial
                      ? "text-green-500"
                      : "text-description"
                  }
                >
                  Must include one special character (e.g., ! @ # $ % & *).
                </li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-black py-3 rounded-xl hover:bg-primary/90 transition disabled:opacity-70"
            >
              {isLoading ? "Submitting..." : "Submit"}
            </button>
          </form>
        </div>
      </div>
    </AuthLayout>
  );
}
