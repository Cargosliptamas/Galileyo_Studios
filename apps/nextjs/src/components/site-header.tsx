"use client";

import PublicNavbar from "./layout/public-navbar";
import AuthNavbar from "./layout/auth-navbar";
import type { User } from "~/auth/client";

export function SiteHeader({ user }: { user: User | undefined }) {
  return (
    <>
      {
        user ? (
          <AuthNavbar user={user} />
        ) : (
          <PublicNavbar />
        )
      }
    </>
  );

  // return (
  //   <header className="sticky top-0 z-50 w-full bg-background">
  //     {/* Navigation */}
  //     <nav className="relative z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur-sm">
  //       <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
  //         <div className="flex items-center justify-between py-4">
  //           <div className="flex items-center space-x-2">
  //             <Link href="/" className="flex items-center space-x-2">
  //               <AppIcon />
  //               <span className="text-2xl font-bold text-white">Galileyo</span>
  //             </Link>
  //           </div>

  //           {/* Desktop Navigation */}
  //           <div className="hidden items-center space-x-8 md:flex">
  //             <Link
  //               href="/#features"
  //               className="text-slate-300 transition-colors hover:text-white"
  //             >
  //               Features
  //             </Link>
  //             <Link
  //               href="/#pricing"
  //               className="text-slate-300 transition-colors hover:text-white"
  //             >
  //               Pricing
  //             </Link>
  //             <Link
  //               href="/#support"
  //               className="text-slate-300 transition-colors hover:text-white"
  //             >
  //               Support
  //             </Link>
  //             {user ? (
  //               <UserMenu user={user} />
  //             ) : (
  //               <Link
  //                 href="/login"
  //                 className="px-4 py-2 text-slate-300 transition-colors hover:text-white"
  //               >
  //                 Sign In
  //               </Link>
  //             )}

  //             <ThemeToggle />
  //           </div>

  //           {/* Mobile menu button */}
  //           <button
  //             className="text-white md:hidden"
  //             onClick={() => setIsMenuOpen(!isMenuOpen)}
  //           >
  //             {isMenuOpen ? (
  //               <X className="h-6 w-6" />
  //             ) : (
  //               <Menu className="h-6 w-6" />
  //             )}
  //           </button>
  //         </div>
  //       </div>

  //       {/* Mobile Navigation */}
  //       {isMenuOpen && (
  //         <div className="border-b border-slate-800 bg-slate-900 md:hidden">
  //           <div className="space-y-4 px-4 py-4">
  //             <a
  //               href="#features"
  //               className="block text-slate-300 transition-colors hover:text-white"
  //             >
  //               Features
  //             </a>
  //             <a
  //               href="#pricing"
  //               className="block text-slate-300 transition-colors hover:text-white"
  //             >
  //               Pricing
  //             </a>
  //             <a
  //               href="#support"
  //               className="block text-slate-300 transition-colors hover:text-white"
  //             >
  //               Support
  //             </a>
  //             <button className="block w-full text-left text-slate-300 transition-colors hover:text-white">
  //               Sign In
  //             </button>
  //             <button className="block w-full rounded-lg bg-cyan-500 px-6 py-2 font-medium text-white transition-colors hover:bg-cyan-400">
  //               Select Plan
  //             </button>
  //           </div>
  //         </div>
  //       )}
  //     </nav>
  //   </header>
  // );
}
