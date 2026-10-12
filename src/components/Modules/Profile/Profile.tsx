"use client";

import basketballIcon from "@/assets/dashboard/ball.png";
import profilePlaceholder from "@/assets/navbar/profile.png";
import { useGetMeQuery } from "@/redux/api/userApi";
import {
  Building,
  Edit3,
  Globe,
  KeyRound,
  Mail,
  MapPin,
  ShieldCheck,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Profile() {
  const { data, isLoading, isError } = useGetMeQuery();
  const user = data?.result;

  // Profile is considered completed if the user has a profile with details (city, country, profileImage, or userName)
  const isProfileCompleted = Boolean(
    user && (user.city || user.country || user.profileImage || user.userName)
  );

  if (isLoading) {
    return (
      <div className="my-6 max-w-5xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-white/10 rounded-lg animate-pulse" />
        <div className="rounded-2xl border border-white/10 bg-[#000000] p-6 md:p-8 space-y-6 animate-pulse">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-white/10" />
            <div className="space-y-3 flex-1">
              <div className="h-6 w-48 bg-white/10 rounded" />
              <div className="h-4 w-64 bg-white/5 rounded" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="h-20 bg-white/5 rounded-xl" />
            <div className="h-20 bg-white/5 rounded-xl" />
            <div className="h-20 bg-white/5 rounded-xl" />
            <div className="h-20 bg-white/5 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // If user has NOT set up their profile yet, show the "Welcome / Create My Profile" onboarding card
  if (!isProfileCompleted || isError) {
    return (
      <section className="flex min-h-[calc(100vh-96px)] items-center justify-center px-4 py-10 text-center text-title">
        <div className="max-w-md">
          <div className="mx-auto flex items-center justify-center rounded-full">
            <div className="flex items-center justify-center rounded-full">
              <Image
                src={basketballIcon}
                alt="Basketball"
                width={150}
                height={150}
                className="object-contain drop-shadow-[0_12px_13px_rgba(251,163,15,0.9)]"
              />
            </div>
          </div>

          <h1 className="mt-6 text-4xl font-semibold leading-none text-white">
            Welcome to Hoops!
          </h1>

          <p className="mx-auto mt-3 max-w-sm text-base leading-6 text-description">
            Create your player profile to join games, track stats, and connect
            with other ballers.
          </p>

          <Link href="/edit-profile" className="inline-block">
            <button className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#FBA30F] to-[#D25A00] px-6 text-base font-medium text-white transition-opacity hover:opacity-90">
              Create My Profile
            </button>
          </Link>
        </div>
      </section>
    );
  }

  // When profile is completed, display the full profile view with "Edit Profile" button
  const avatarUrl = user?.profileImage || profilePlaceholder;
  const locationString = [user?.city, user?.country].filter(Boolean).join(", ");

  return (
    <div className="my-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">My Profile</h1>
          <p className="text-sm text-description mt-1">
            Manage your personal details and account settings
          </p>
        </div>

        <Link href="/edit-profile">
          <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FBA30F] to-[#D25A00] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#FBA30F]/20 transition-all hover:opacity-95 hover:scale-[1.02]">
            <Edit3 size={16} />
            Edit Profile
          </button>
        </Link>
      </div>

      {/* Main Profile Card */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#000000] shadow-2xl">
        {/* Banner with Accent */}
        <div className="relative h-32 bg-gradient-to-r from-[#FBA30F]/20 via-[#D25A00]/20 to-transparent p-6 border-b border-white/5 flex items-end">
          <div className="absolute top-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
            <ShieldCheck size={14} />
            Active Account
          </div>
        </div>

        <div className="px-6 pb-8 md:px-8">
          {/* Avatar and Basic Info */}
          <div className="relative -mt-16 flex flex-col sm:flex-row sm:items-end gap-5 pb-6 border-b border-white/10">
            <div className="relative h-28 w-28 overflow-hidden rounded-2xl border-4 border-[#000000] bg-gray-900 shadow-xl">
              <Image
                src={avatarUrl}
                alt={user?.userName || "User Avatar"}
                width={112}
                height={112}
                className="h-full w-full object-cover"
                unoptimized
              />
            </div>

            <div className="flex-1 space-y-1">
              <h2 className="text-2xl font-bold text-white">
                {user?.userName || "Anonymous Baller"}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-sm text-description">
                <span className="flex items-center gap-1.5 text-description">
                  <Mail size={15} className="text-primary" />
                  {user?.email}
                </span>
                {locationString && (
                  <span className="flex items-center gap-1.5 text-description">
                    <MapPin size={15} className="text-primary" />
                    {locationString}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/edit-profile">
                <button className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#1a1d22] px-4 py-2 text-sm font-medium text-white transition-colors hover:border-primary/50 hover:bg-white/5">
                  <KeyRound size={15} className="text-description" />
                  Security
                </button>
              </Link>
            </div>
          </div>

          {/* Detailed Info Grid */}
          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-semibold text-white">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="rounded-xl border border-white/10 bg-[#14161B] p-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <User size={22} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-description">
                    Display Name
                  </p>
                  <p className="text-base font-medium text-white mt-0.5">
                    {user?.userName || "—"}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="rounded-xl border border-white/10 bg-[#14161B] p-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Mail size={22} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-description">
                    Email Address
                  </p>
                  <p className="text-base font-medium text-white mt-0.5">
                    {user?.email || "—"}
                  </p>
                </div>
              </div>

              {/* City */}
              <div className="rounded-xl border border-white/10 bg-[#14161B] p-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Building size={22} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-description">
                    City
                  </p>
                  <p className="text-base font-medium text-white mt-0.5">
                    {user?.city || "Not provided"}
                  </p>
                </div>
              </div>

              {/* Country */}
              <div className="rounded-xl border border-white/10 bg-[#14161B] p-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Globe size={22} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-description">
                    Country
                  </p>
                  <p className="text-base font-medium text-white mt-0.5">
                    {user?.country || "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
