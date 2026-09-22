"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if session exists on mount and whenever route changes
    setIsLoggedIn(!!localStorage.getItem("ai_user_session"));
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("ai_user_session");
    setIsLoggedIn(false);
    router.push("/login");
  };

  return (
    <nav className="flex items-center justify-between px-6 sm:px-12 py-6 max-w-7xl mx-auto w-full">
      {/* Left Side: Logo & Links */}
      <div className="flex items-center gap-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            InterviewAI
          </span>
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500">
          <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
          <Link href="/#about" className="hover:text-slate-900 transition-colors">About Us</Link>
          <Link href={isLoggedIn ? "/dashboard" : "/login"} className="hover:text-slate-900 transition-colors">Dashboard</Link>
        </div>
      </div>

      {/* Right Side: Auth */}
      <div className="flex items-center gap-4 text-sm font-medium">
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="px-5 py-2.5 rounded-full border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm hidden sm:block"
          >
            Sign Out
          </button>
        ) : (
          <>
            <Link href="/login" className="text-slate-500 hover:text-slate-900 transition-colors hidden sm:block">
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2.5 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
