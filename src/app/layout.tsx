import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Roboto } from "next/font/google";
import { TrpcProvider } from "@/components/providers/TrpcProvider";
import { connectDB } from "@/db";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "ADDies Logistics Management System (ALMS)",
  description: "Smart Logistics • Smart Fleet • Smart Business ERP Portal",
};

// Mobile browser chrome adopts the brand primary (see src/styles/theme.css)
export const viewport: Viewport = {
  themeColor: "#2459eb",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: ReactNode }) {
  try {
    await connectDB();
  } catch (error) {
    console.error("Startup DB connect failed (continuing without DB):", error);
  }

  return (
    <html lang="en">
      <body className={`${roboto.className} ${roboto.variable} bg-surface text-ink antialiased min-h-screen selection:bg-brand selection:text-white`}>
        <TrpcProvider>{children}</TrpcProvider>
      </body>
    </html>
  );
}
