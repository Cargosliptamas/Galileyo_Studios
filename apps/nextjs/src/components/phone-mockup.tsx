import type { ReactNode } from "react";
import { RiBatteryFill, RiWifiFill } from "@remixicon/react";
import { Signal } from "lucide-react";

export function PhoneMessageBubble({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-2 px-2">
      <div className="flex flex-1 flex-col rounded-lg bg-slate-100 p-2 dark:bg-slate-700">
        <div className="mb-1 flex flex-col">
          <span className="text-sm">{children}</span>
        </div>

        <div className="flex justify-end">
          <span className="text-xs text-muted-foreground">12:41</span>
        </div>
      </div>
    </div>
  );
}

// export function PhoneMockup({
//   children,
// }: {
//   children: ReactNode | ReactNode[];
// }) {
//   return (
//     <div className="relative mx-auto h-[600px] w-[300px] rounded-[2.5rem] border-[14px] border-gray-800 bg-gray-800 dark:border-zinc-900 dark:bg-zinc-900">
//       <div className="absolute -start-[17px] top-[72px] h-[32px] w-[3px] rounded-s-lg bg-gray-800 dark:bg-zinc-900"></div>
//       <div className="absolute -start-[17px] top-[124px] h-[46px] w-[3px] rounded-s-lg bg-gray-800 dark:bg-zinc-900"></div>
//       <div className="absolute -start-[17px] top-[178px] h-[46px] w-[3px] rounded-s-lg bg-gray-800 dark:bg-zinc-900"></div>
//       <div className="absolute -end-[17px] top-[142px] h-[64px] w-[3px] rounded-e-lg bg-gray-800 dark:bg-zinc-900"></div>
//       <div className="h-[572px] w-[272px] overflow-hidden rounded-[2rem] bg-white dark:bg-zinc-900">
//         <div className="flex h-full flex-col">
//           <div className="flex select-none items-center justify-between px-3 py-2 text-center">
//             <div className="text-sm">12:41</div>
//             <div className="grid grid-cols-3 gap-1">
//               <Signal className="h-4 w-4" />
//               <RiWifiFill className="h-4 w-4" />
//               <RiBatteryFill className="h-4 w-4" />
//             </div>
//           </div>

//           {children}
//         </div>
//       </div>
//     </div>
//   );
// }

export function PhoneMockup({ children }: { children: ReactNode | ReactNode[] }) {
  return (
    <div className="flex items-center justify-center">
      {/* iPhone 15 Container */}
      <div className="relative w-72 h-[600px] rounded-[45px] shadow-[0_0_2px_2px_rgba(255,255,255,0.1)] border-8 border-zinc-900">
        {/* Dynamic Island */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-[90px] h-[22px] bg-black rounded-full z-20">
        </div>

        <div className="absolute -inset-[1px] border-[3px] border-zinc-700 border-opacity-40 rounded-[37px] pointer-events-none dark:bg-zinc-900">
          <div className="flex h-full flex-col">
            <div className="flex select-none items-center justify-between px-3 py-2 text-center">
              <div className="text-sm">12:41</div>
              <div className="grid grid-cols-3 gap-1">
                <Signal className="h-4 w-4" />
                <RiWifiFill className="h-4 w-4" />
                <RiBatteryFill className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Screen Content */}
        <div className="relative w-full h-full rounded-[37px] overflow-hidden flex bg-zinc-900/10 py-10">
          {children}
        </div>

        {/* Left Side Buttons */}
        {/* Silent Switch */}
        <div className="absolute left-[-12px] top-20 w-[6px] h-8 bg-zinc-900 rounded-l-md shadow-md"></div>

        {/* Volume Up */}
        <div className="absolute left-[-12px] top-36 w-[6px] h-12 bg-zinc-900 rounded-l-md shadow-md"></div>

        {/* Volume Down */}
        <div className="absolute left-[-12px] top-52 w-[6px] h-12 bg-zinc-900 rounded-l-md shadow-md"></div>

        {/* Right Side Button (Power) */}
        <div className="absolute right-[-12px] top-36 w-[6px] h-16 bg-zinc-900 rounded-r-md shadow-md"></div>
      </div>
    </div>
  );
}
