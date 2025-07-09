"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
// import Image from "next/image";
import Link from "next/link";

import { ThemeToggle } from "@galileyo/ui/theme";
import { AppIcon } from "./app-icon";
import type { User } from "better-auth";
import { UserMenu } from "./layout/user-menu";

export function SiteHeader({ user }: { user: User | undefined }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-background sticky top-0 z-50 w-full">
      {/* Navigation */}
      <nav className="relative z-50 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Link href="/" className="flex items-center space-x-2">
                <AppIcon />
                <span className="text-2xl font-bold text-white">Galileyo</span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/#features" className="text-slate-300 hover:text-white transition-colors">Features</Link>
              <Link href="/#pricing" className="text-slate-300 hover:text-white transition-colors">Pricing</Link>
              <Link href="/#support" className="text-slate-300 hover:text-white transition-colors">Support</Link>
              {user ? (
                <UserMenu user={user} />
              ) : (
                <Link href="/login" className="px-4 py-2 text-slate-300 hover:text-white transition-colors">Sign In</Link>
              )}

              <ThemeToggle />
            </div>

            {/* Mobile menu button */}
            <button 
              className="md:hidden text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800">
            <div className="px-4 py-4 space-y-4">
              <a href="#features" className="block text-slate-300 hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="block text-slate-300 hover:text-white transition-colors">Pricing</a>
              <a href="#support" className="block text-slate-300 hover:text-white transition-colors">Support</a>
              <button className="block w-full text-left text-slate-300 hover:text-white transition-colors">Sign In</button>
              <button className="block w-full px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg font-medium transition-colors">
                Select Plan
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}