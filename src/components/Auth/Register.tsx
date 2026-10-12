"use client";

import { useRegisterMutation } from "@/redux/api/userApi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { toast } from "sonner";
import AuthLayout from "./AuthLayout";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";


export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    userName: "",
    email: "",
    password: "",
  });
  const { userName, email, password } = formData;

  const [registerFn] = useRegisterMutation();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = { userName: "", email: "", password: "" };

    if (!userName.trim()) {
      newErrors.userName = "Full name is required";
    }
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);

    if (newErrors.userName || newErrors.email || newErrors.password) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await registerFn({ userName, email, password }).unwrap();
      toast.success("Registration successful");
      router.push("/login");
    } catch (err: any) {
      toast.error(err?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  // const handleGoogleLogin = () => {
  //   setGoogleLoading(true);
  //   localStorage.setItem("googleSignIn", "true");

  //   signIn("google").catch((err) => {
  //     console.error("Google login error:", err);
  //     toast.error("Google login failed. Please try again.");
  //     setGoogleLoading(false);
  //   });
  // };

  return (
    <AuthLayout title="" subtitle="">
      <h2 className="text-center bg-gradient-to-r from-[#FF6D2B] to-[#FBA30F] bg-clip-text text-transparent font-semibold  text-3xl md:text-5xl mb-6">
        HOOPERS ELITE
      </h2>
      <div className="flex items-center justify-center px-4 py-8 md:py-12">
        <div className="w-full max-w-3xl bg-card rounded-2xl shadow-lg p-8 space-y-6">
          {/* Header */}
          <div className="">
            <h2 className="text-3xl font-bold text-white mb-2">Sign Up</h2>
            <p className="text-description text-lg">
              Let&apos;s create an account first
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Full Name */}
            <div>
              <label
                htmlFor="userName"
                className="block text-lg font-medium text-title mb-1"
              >
                Full Name
              </label>
              <input
                type="text"
                placeholder="Full Name"
                value={userName}
                onChange={(e) => {
                  setFormData({ ...formData, userName: e.target.value });
                  setErrors({ ...errors, userName: "" });
                }}
                className="w-full px-2 py-2 border border-gray-300 bg-transparent focus:outline-none focus:border-primary text-title rounded-xl"
              />
              {errors.userName && (
                <p className="text-red-500 text-sm mt-1">{errors.userName}</p>
              )}
            </div>

            {/* Email Address */}
            <div>
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
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  setErrors({ ...errors, email: "" });
                }}
                className="w-full px-2 py-2 border border-gray-300 bg-transparent focus:outline-none focus:border-primary text-title rounded-xl"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password with Eye Button */}
            <div className="relative">
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
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  setErrors({ ...errors, password: "" });
                }}
                className="w-full px-2 py-2 border border-gray-300 bg-transparent focus:outline-none focus:border-primary text-title rounded-xl"
              />

              {/* Eye Button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-2/3 transform -translate-y-1/2 text-gray-400 hover:text-white transition"
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Sign Up Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-black font-normal py-3 rounded-lg transition "
              >
                {isLoading ? "Signing up..." : "Sign Up"}
              </button>
            </div>
          </form>

          {/* OR Separator */}
          <div className="flex items-center gap-4">
            <div className="flex-1 border-t border-gray-700"></div>
            <span className="text-gray-500 text-sm">OR</span>
            <div className="flex-1 border-t border-gray-700"></div>
          </div>

          {/* Continue with Google */}
          {/* <div className="pt-3  flex justify-center items-center">
            <button
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-2 border border-gray-700 bg-white hover:bg-white/90 text-black font-medium py-3  px-8 rounded-xl transition "
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
          </div> */}

          {/* Login Link */}
          <div className="text-center">
            <p className="text-gray-400 text-base">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
