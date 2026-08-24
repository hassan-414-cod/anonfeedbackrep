"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { User, LogOut, PlusCircle, LayoutDashboard, Search } from "lucide-react";

export default function Navbar() {
  const { user, userProfile, logout } = useAuth();

  return (
    <nav className="bg-white border-b-4 border-black sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-x-4 border-black border-t-0 border-b-0 h-full">
        <div className="flex justify-between h-16 items-center">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-black tracking-tighter uppercase italic text-[#1A1A1A] hover:opacity-80">
                AnonFeedback
              </Link>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-6 items-center text-xs font-bold uppercase tracking-widest">
              <Link href="/" className="text-[#1A1A1A] hover:border-b-2 border-black">Feed</Link>
              <Link href="/leaderboard" className="text-gray-400 hover:text-black">Leaderboard</Link>
            </div>
          </div>
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link href="/billing" className="hidden sm:block text-xs font-bold uppercase tracking-widest text-[#1A1A1A] hover:opacity-70">Pricing</Link>
            <Link href="/upload" className="inline-flex items-center px-3 sm:px-4 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-tighter bg-[#FFE66D] border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
              Upload Project
            </Link>
            
            {user ? (
              <>
                <div className="flex items-center space-x-4 border-l-2 border-black pl-4 ml-2">
                   <Link href="/profile" className="flex items-center group">
                      <div className="text-right mr-3 hidden sm:block">
                        <div className="text-[10px] font-bold uppercase opacity-50 text-[#1A1A1A]">Identity</div>
                        <div className="text-xs font-mono font-bold text-[#1A1A1A]">{userProfile?.anonymous_handle || "Loading..."}</div>
                      </div>
                      <div className="w-8 h-8 bg-indigo-500 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] flex items-center justify-center font-bold text-white group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:shadow-none transition-all">
                        {userProfile?.anonymous_handle?.[0] || "?"}
                      </div>
                   </Link>
                   <button onClick={logout} className="text-[#1A1A1A] hover:bg-gray-100 p-1 border-2 border-transparent hover:border-black transition-all">
                     <LogOut className="h-5 w-5" />
                   </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="hidden sm:block text-xs font-bold uppercase tracking-widest text-[#1A1A1A] hover:opacity-70 ml-2">Log in</Link>
                <Link href="/signup" className="hidden sm:inline-flex items-center px-4 py-2 text-xs font-bold uppercase tracking-tighter bg-[#FF6B6B] border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all ml-2">
                  Join Anonymously
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
