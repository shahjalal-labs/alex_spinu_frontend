"use client";

import profilePlaceholder from "@/assets/navbar/profile.png";

import {
  useGetMeQuery,
  useUpdateProfileImageMutation,
  useUpdateProfileMutation,
} from "@/redux/api/userApi";
import { ChevronRight, Info, Pencil } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import ChangePassword from "./ChangePassword";

type TabKey = "basic" | "account";

type ProfileForm = {
  fullName: string;
  email: string;
  country: string;
  city: string;
};

type PasswordForm = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const tabConfig: Array<{ key: TabKey; label: string }> = [
  { key: "basic", label: "Edit Profile" },
  { key: "account", label: "Change Password" },
];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-2 block text-sm font-medium text-description">
      {children}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  readOnly,
  type = "text",
  orange = false,
  rightAdornment,
}: {
  value: string;
  onChange?: (value: string) => void;
  placeholder: string;
  readOnly?: boolean;
  type?: string;
  orange?: boolean;
  rightAdornment?: React.ReactNode;
}) {
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        placeholder={placeholder}
        onChange={(event) => onChange?.(event.target.value)}
        className={`h-12 w-full rounded-lg border px-4 text-base outline-none transition-colors ${
          orange
            ? "border-0 bg-primary text-black placeholder:text-black/60"
            : "border border-white/10 bg-[#1a1d22] text-white placeholder:text-description focus:border-primary"
        } ${rightAdornment ? "pr-12" : ""}`}
      />
      {rightAdornment ? (
        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-description">
          {rightAdornment}
        </div>
      ) : null}
    </div>
  );
}

function BasicProfilePanel() {
  const router = useRouter();
  const { data } = useGetMeQuery();
  const [updateProfile, { isLoading: isUpdatingProfile }] =
    useUpdateProfileMutation();
  const [updateProfileImage, { isLoading: isUpdatingImage }] =
    useUpdateProfileImageMutation();
  const [form, setForm] = useState<ProfileForm>({
    fullName: "",
    email: "",
    country: "",
    city: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLoading = isUpdatingProfile || isUpdatingImage;

  useEffect(() => {
    if (data?.result) {
      setForm({
        fullName: data.result.userName || data.result.fullName || "",
        email: data.result.email || "",
        country: data.result.country || "",
        city: data.result.city || "",
      });
      setPreview(data.result.profileImage || null);
    }
  }, [data]);

  const imageSrc = useMemo(
    () => preview || data?.result?.profileImage || profilePlaceholder,
    [data, preview],
  );

  const handlePickPhoto = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleSave = async () => {
    try {
      // 1. Update profile text fields
      await updateProfile({
        userName: form.fullName,
        city: form.city,
        country: form.country,
      }).unwrap();

      // 2. If a new image was selected, upload it separately
      if (file) {
        const imageForm = new FormData();
        imageForm.append("profileImage", file);
        await updateProfileImage(imageForm).unwrap();
      }

      toast.success("Profile updated successfully");
      router.push("/profile");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update profile");
    }
  };

  return (
    <div className="space-y-0 bg-[#000000] p-4 md:p-8 rounded-xl shadow-xl">
      <div className="border-b border-white/40 pb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold leading-none text-white">
            Profile Information
          </h2>
          <Info size={18} className="text-description" />
        </div>
      </div>

      <div className="mt-6 w-full space-y-5">
        <div className="space-y-3">
          <p className="text-lg font-medium text-description py-3">
            Photo Profile
          </p>
          <div className="relative inline-block">
            <div className="h-36 w-36 overflow-hidden rounded-lg bg-gray-900 p-1">
              <Image
                src={imageSrc}
                alt="Profile photo"
                width={100}
                height={100}
                className="h-full w-full rounded-md object-cover"
                unoptimized
              />
            </div>
            <button
              type="button"
              onClick={handlePickPhoto}
              className="absolute -bottom-0 -right-0 rounded-r-xl rounded-t-none flex h-8 w-8 items-center justify-center bg-white shadow-md"
            >
              <Pencil size={15} className="text-black" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        <div>
          <FieldLabel>Display Name</FieldLabel>
          <TextInput
            value={form.fullName}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, fullName: value }))
            }
            placeholder="Bryan Adams"
          />
        </div>

        <div>
          <FieldLabel>Email</FieldLabel>
          <TextInput
            value={form.email}
            placeholder="bryanadams@gmail.com"
            readOnly
            orange
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>Country</FieldLabel>
            <TextInput
              value={form.country}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, country: value }))
              }
              placeholder="e.g. United States, Bangladesh"
            />
          </div>

          <div>
            <FieldLabel>City</FieldLabel>
            <TextInput
              value={form.city}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, city: value }))
              }
              placeholder="e.g. New York, Gazipur"
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="h-12 min-w-[120px] rounded-lg bg-gradient-to-r from-[#FBA30F] to-[#D25A00] px-8 text-base font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EditProfile() {
  const [activeTab, setActiveTab] = useState<TabKey>("basic");

  return (
    <div className="my-6">
      <h1 className="text-2xl font-semibold  text-white">Profile</h1>

      <div className="min-h-screen bg-[#14161B] mt-2 md:mt-0  md:p-6 lg:p-8">
        <div className="grid grid-cols-1 gap-8 rounded-2xl   lg:grid-cols-[400px_minmax(0,2fr)]">
          <aside className="space-y-3 bg-[#000000] p-4 py-4 rounded-xl h-52 shadow-xl">
            {tabConfig.map((tab) => {
              const active = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-left font-medium transition-colors ${
                    active
                      ? "bg-primary text-black"
                      : " text-description hover:bg-white/10"
                  }`}
                >
                  <span>{tab.label}</span>
                  <ChevronRight
                    size={20}
                    className={active ? "text-black" : "text-white/40"}
                  />
                </button>
              );
            })}
          </aside>

          <main className="w-full">
            {activeTab === "basic" ? <BasicProfilePanel /> : <ChangePassword />}
          </main>
        </div>
      </div>
    </div>
  );
}
