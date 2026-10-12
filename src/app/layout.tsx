import logo from "@/assets/logo.png";
// import ReduxProvider from "@/redux/ReduxProvider";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers/providers";
import { AuthSync } from "@/components/Auth/AuthSync";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: " Hoopers Elite",
  description:
    "Hoopers Elite is a comprehensive basketball platform that provides players, coaches, and fans with the tools and resources they need to excel in the game. From court reservations and game scheduling to player rankings and coaching resources, Hoopers Elite is your one-stop destination for all things basketball.",
  icons: {
    icon: logo.src,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* <NavBar /> */}
        <Providers>
          <AuthSync />
          {children}
        </Providers>

        {/* <Footer /> */}
      </body>
    </html>
  );
}
