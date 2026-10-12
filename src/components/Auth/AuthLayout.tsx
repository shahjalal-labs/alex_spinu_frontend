import logo from "@/assets/logo.png";

import Image from "next/image";
import type React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function AuthLayout({
  children,
  title,
  subtitle,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex text-white ">
      {/* Left side - Logo and branding */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-8 bg-secondary">
        <div className="text-center">
          {/* Main Logo */}
          <Image
            src={logo}
            alt="kal-sayegh Logo"
            width={532}
            height={300}
            className="mx-auto mb-6"
          />
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between md:p-8 bg-body ">
        <div className="flex items-center justify-center flex-1 ">
          <div className="w-full md:max-w-[650px]  ">
            {/* Mobile logo */}
            <div className="lg:hidden text-center mb-8">
              <Image
                src={logo}
                alt="kal-sayegh Logo"
                width={200}
                height={200}
                className="mx-auto mb-4"
              />
            </div>

            <div className="  rounded-2xl">
              <div className="mb-6">
                <h2 className="text-2xl md:text-[32px] font-semibold text-default mb-6">
                  {title}
                </h2>
                {subtitle && <p className="text-grey text-base">{subtitle}</p>}
              </div>
              {children}
            </div>
          </div>
        </div>

        {/* Footer always at bottom */}
        <div className="text-center my-8">
          <p className="text-base text-description">
            <span className="text-base font-medium  ">
              © {new Date().getFullYear()} HOOPERS ELITE.
            </span>{" "}
            All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
