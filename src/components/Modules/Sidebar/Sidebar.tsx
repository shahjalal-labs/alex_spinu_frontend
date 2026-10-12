"use client";

import basketballIcon from "@/assets/dashboard/basketball-01.png";
import basketball from "@/assets/dashboard/basketball-hoop.png";
import ranking from "@/assets/dashboard/ranking.png";
import coaching from "@/assets/dashboard/sparkles.png";
import highlights from "@/assets/dashboard/video-02.png";
import logo from "@/assets/logo2.png";
import { CustomModal } from "@/components/modal/CustomModal";
import { logOut } from "@/redux/ReduxFunction";
import { useGetMeQuery } from "@/redux/api/userApi";
import Cookies from "js-cookie";
import { LogOut, UserCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

type SidebarProps = {
  onCloseClick?: () => void;
};

type MenuItem = {
  href: string;
  label: string;
  icon: any;
  isImage?: boolean;
};

const menuItems: MenuItem[] = [
  { href: "/courts", label: "Courts", icon: basketball, isImage: true },
  { href: "/games", label: "Games", icon: basketballIcon, isImage: true },
  { href: "/highlights", label: "Highlights", icon: highlights, isImage: true },
  { href: "/rankings", label: "Rankings", icon: ranking, isImage: true },
  { href: "/coaching", label: "Coaching", icon: coaching, isImage: true },
  { href: "/profile", label: "Profile", icon: UserCircle2 },
];

export default function Sidebar({ onCloseClick }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Get token from Redux store (persisted, reliable)
  const storeToken = useSelector((state: RootState) => state.auth?.token);
  const hasToken = !!storeToken || !!Cookies.get("token");

  // Fetch real user profile — only when authenticated
  const { data: profileData } = useGetMeQuery(undefined, {
    skip: !hasToken,
  });
  const user = profileData?.result;

  useEffect(() => setIsMounted(true), []);

  const handleConfirmLogout = () => {
    Cookies.remove("token");
    dispatch(logOut());
    router.push("/login");
    setShowLogoutModal(false);
  };

  const isMenuItemActive = (href: string) => {
    if (href === "/profile") {
      return (
        pathname === "/profile" ||
        pathname === "/edit-profile" ||
        pathname?.startsWith("/profile/")
      );
    }

    if (href === "/courts") {
      return pathname === "/courts" || pathname?.startsWith("/all-court/");
    }

    if (href === "/games") {
      return pathname === "/games" || pathname?.startsWith("/all-games/");
    }

    if (href === "/rankings") {
      return pathname === "/rankings" || pathname?.startsWith("/player/");
    }

    if (href === "/highlights") {
      return (
        pathname === "/highlights" ||
        pathname === "/upload-highlight" ||
        pathname?.startsWith("/highlights/")
      );
    }

    return pathname === href;
  };

  const renderMenuLink = (item: MenuItem, isMobile: boolean) => {
    const isActive = isMenuItemActive(item.href);

    return (
      <Link
        href={item.href}
        onClick={isMobile ? undefined : onCloseClick}
        className={`flex transition-colors ${
          isMobile
            ? "flex-col items-center rounded-sm justify-center gap-1 px-2 py-2"
            : "items-center gap-3 rounded-xl px-3 py-3"
        } ${
          isActive
            ? "bg-primary text-black"
            : "text-description hover:bg-white/5 hover:text-title"
        }`}
      >
        {item.isImage ? (
          <Image
            src={item.icon}
            alt={item.label}
            width={isMobile ? 24 : 18}
            height={isMobile ? 24 : 18}
            className={isActive ? "brightness-0" : "brightness-0 invert"}
          />
        ) : (
          <item.icon className={isMobile ? "h-6 w-6" : "h-4 w-4"} />
        )}

        <span className={isMobile ? "sr-only" : "font-medium"}>
          {item.label}
        </span>
      </Link>
    );
  };

  const modalContent = (
    <CustomModal
      open={showLogoutModal}
      onClose={() => setShowLogoutModal(false)}
      title=""
      actions={[
        {
          label: "Cancel",
          onClick: () => setShowLogoutModal(false),
          variant: "secondary",
        },
        {
          label: "Log Out",
          onClick: handleConfirmLogout,
          variant: "primary",
        },
      ]}
    >
      <div className="flex flex-col items-center gap-4 py-4 bg-[#120B07] rounded-lg">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-primary">
          <span className="text-4xl font-bold text-primary">?</span>
        </div>

        <h3 className="text-4xl font-semibold text-white">Are You Sure?</h3>

        <p className="text-center text-description text-lg">
          Do you want to log out?
        </p>
      </div>
    </CustomModal>
  );

  return (
    <>
      <div className="flex">
        {/* SIDEBAR */}
        <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-72 flex-col border-r border-white/10 bg-[#060a12] text-title">
          <div className="px-6 py-6 flex justify-center">
            <Image src={logo} alt="logo" width={90} height={90} />
          </div>

          <p className="px-6 pb-3 text-xs uppercase text-description">
            Management
          </p>

          {/* MENU */}
          <nav className="flex-1 overflow-y-auto px-3">
            <ul className="space-y-1.5">
              {menuItems.map((item) => (
                <li key={item.href}>{renderMenuLink(item, false)}</li>
              ))}
            </ul>
          </nav>

          {/* USER */}
          <div className="p-4">
            <div className="flex items-center justify-between rounded-xl bg-[#23170e] px-3 py-3">
              <div className="flex items-center gap-2">
                {user?.profileImage ? (
                  <Image
                    src={user.profileImage}
                    alt="profile"
                    width={40}
                    height={40}
                    className="rounded-full object-cover h-10 w-10"
                    unoptimized
                  />
                ) : (
                  <Image src={logo} alt="profile" width={40} height={40} />
                )}
                <div>
                  <p className="text-sm text-title">
                    {user?.userName || user?.name || "—"}
                  </p>
                  <p className="text-xs text-description">
                    {user?.email || "—"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowLogoutModal(true)}
                className="text-red-500"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="flex-1 lg:ml-72 min-h-screen">
          {/* page content */}
        </main>
      </div>

      {/* MOBILE NAV */}
      <nav className="fixed inset-x-0 bottom-0 z-50 lg:hidden bg-[#060a12] border-t border-white/10">
        <ul className="grid grid-cols-6">
          {menuItems.map((item) => (
            <li key={item.href}>{renderMenuLink(item, true)}</li>
          ))}
        </ul>
      </nav>

      {/* MODAL */}
      {isMounted && createPortal(modalContent, document.body)}
    </>
  );
}
