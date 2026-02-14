"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Sidebar from "./Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex bg-gray-950 min-h-screen text-gray-100 relative isolate">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-gray-900 border-b border-gray-800 z-50 px-4 flex justify-between items-center shadow-md">
        <span className="font-bold text-lg text-white tracking-tight">
          Arthavi Admin
        </span>
        <button
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="text-gray-300 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          aria-label="Toggle Menu">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Wrapper */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-40 transform h-[100dvh] bg-gray-900
        ${isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"} 
        md:relative md:translate-x-0 md:shadow-none md:block
        transition-transform duration-300 ease-in-out
      `}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full min-w-0 flex flex-col pt-16 md:pt-0 overflow-y-auto h-[100dvh]">
        {/* Container for content padding */}
        <div className="flex-1 p-4 md:p-8 w-full max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
