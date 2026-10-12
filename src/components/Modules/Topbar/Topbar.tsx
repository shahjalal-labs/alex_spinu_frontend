"use client";

import { Menu } from "lucide-react";

type TopbarProps = {
  onHamburgerClick: () => void;
};

export default function Topbar({ onHamburgerClick }: TopbarProps) {
  return (
    <header className="bg-[#14161B] p-4 md:p-0">
      <div className="flex items-center justify-between">
        <button
          className="rounded-lg p-2 text-title lg:hidden"
          onClick={onHamburgerClick}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden h-9 lg:block" />
      </div>
    </header>
  );
}
