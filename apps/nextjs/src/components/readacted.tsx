import { cn } from "@galileyo/ui";

export function Readacted({ className }: { className?: string }) {
  return (
    <span
      className={cn("relative inline-flex h-5 w-40 items-center", className)}
    >
      <span className="absolute inset-0 rounded bg-slate-300/70 blur-[1.5px] dark:bg-slate-600/70" />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="absolute right-0 h-4 w-4 text-slate-500 dark:text-slate-400"
        aria-hidden="true"
      >
        <path d="M12 1.5a4.5 4.5 0 00-4.5 4.5v3h-1.125A1.875 1.875 0 004.5 10.875v8.25A1.875 1.875 0 006.375 21h11.25A1.875 1.875 0 0019.5 19.125v-8.25A1.875 1.875 0 0017.625 9H16.5V6A4.5 4.5 0 0012 1.5zm-3 7.5V6a3 3 0 116 0v3H9z" />
      </svg>
      <span className="sr-only">Redacted</span>
    </span>
  );
}
