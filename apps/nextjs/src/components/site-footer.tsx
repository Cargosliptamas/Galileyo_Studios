// import Image from "next/image";
import Link from "next/link";
import { AppIcon } from "./app-icon";

export function SiteFooter() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/">
            {/* <Image src="/galileyo-icon.svg" alt="Galileyo" width={32} height={32} unoptimized className="w-8 h-8" /> */}
            <AppIcon />
          </Link>
        </div>
      </div>
    </footer>
  );
}