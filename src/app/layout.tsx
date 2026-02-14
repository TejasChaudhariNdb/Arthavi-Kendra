import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import DashboardLayout from "@/components/DashboardLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Arthavi Admin",
  description: "Admin Dashboard for Arthavi",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-gray-950">
      <body className={`${inter.className} h-full text-gray-100 antialiased`}>
        <DashboardLayout>{children}</DashboardLayout>
      </body>
    </html>
  );
}
