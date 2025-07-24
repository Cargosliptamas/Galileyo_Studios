import type { ReactNode } from "react";
import { RiBatteryFill, RiWifiFill } from "@remixicon/react";
import { Signal } from "lucide-react";

export function PhoneMessageBubble({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-2 px-2">
      <div className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-700 p-2 rounded-lg">
        <div className="flex flex-col mb-1">
          <span className="text-sm">{children}</span>
        </div>

        <div className="flex justify-end">
          <span className="text-xs text-muted-foreground">12:41</span>
        </div>
      </div>
    </div>
  );
}

export function PhoneMockup({ children }: { children: ReactNode | ReactNode[] }) {
  return (
    <div className="relative mx-auto border-gray-800 dark:border-zinc-900 bg-gray-800 dark:bg-zinc-900 border-[14px] rounded-[2.5rem] h-[600px] w-[300px]">
      <div className="h-[32px] w-[3px] bg-gray-800 dark:bg-zinc-900 absolute -start-[17px] top-[72px] rounded-s-lg"></div>
      <div className="h-[46px] w-[3px] bg-gray-800 dark:bg-zinc-900 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
      <div className="h-[46px] w-[3px] bg-gray-800 dark:bg-zinc-900 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
      <div className="h-[64px] w-[3px] bg-gray-800 dark:bg-zinc-900 absolute -end-[17px] top-[142px] rounded-e-lg"></div>
      <div className="rounded-[2rem] overflow-hidden w-[272px] h-[572px] bg-white dark:bg-zinc-900">
        <div className="flex flex-col h-full">
          <div className="flex px-3 py-2 items-center justify-between text-center select-none">
            <div className="text-sm">12:41</div>
            <div className="grid grid-cols-3 gap-1">
              <Signal className="w-4 h-4" />
              <RiWifiFill className="w-4 h-4" />
              <RiBatteryFill className="w-4 h-4" />
            </div>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}

// export function PhoneMockup({ children }: { children: ReactNode | ReactNode[] }) {
//   return (
//     <div className="flex items-center justify-center">
//       {/* iPhone 15 Container */}
//       <div className="relative w-72 h-[600px] rounded-[45px] shadow-[0_0_2px_2px_rgba(255,255,255,0.1)] border-8 border-zinc-900">
//         {/* Dynamic Island */}
//         <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-[90px] h-[22px] bg-zinc-900 rounded-full z-20">
//         </div>

//         <div className="absolute -inset-[1px] border-[3px] border-zinc-700 border-opacity-40 rounded-[37px] pointer-events-none"></div>

        
//         {/* Screen Content */}
//         <div className="relative w-full h-full rounded-[37px] overflow-hidden flex bg-zinc-900/10 py-10">
//           {children}
//         </div>
        
//         {/* Left Side Buttons */}
//         {/* Silent Switch */}
//         <div className="absolute left-[-12px] top-20 w-[6px] h-8 bg-zinc-900 rounded-l-md shadow-md"></div>
        
//         {/* Volume Up */}
//         <div className="absolute left-[-12px] top-36 w-[6px] h-12 bg-zinc-900 rounded-l-md shadow-md"></div>
        
//         {/* Volume Down */}
//         <div className="absolute left-[-12px] top-52 w-[6px] h-12 bg-zinc-900 rounded-l-md shadow-md"></div>
        
//         {/* Right Side Button (Power) */}
//         <div className="absolute right-[-12px] top-36 w-[6px] h-16 bg-zinc-900 rounded-r-md shadow-md"></div>
//       </div>
//     </div>
//   );
// }
