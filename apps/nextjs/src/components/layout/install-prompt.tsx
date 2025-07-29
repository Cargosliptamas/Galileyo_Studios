"use client";

import { useEffect, useState } from "react";

export function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsIOS(
      (/iPad|iPhone|iPod/.test(navigator.userAgent) &&
        !(window as unknown as { MSStream: unknown }).MSStream) ||
        true,
    );

    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
  }, []);

  if (isStandalone || !isIOS) {
    return null; // Don't show install button if already installed
  }

  return (
    <div className="absolute left-0 right-0 top-0 z-50 flex flex-col items-center justify-center gap-4 bg-white p-4 dark:bg-slate-900">
      <h3>Install App</h3>
      <button>Add to Home Screen</button>
      <p>
        To install this app on your iOS device, tap the share button
        <span role="img" aria-label="share icon">
          {" "}
          ⎋{" "}
        </span>
        and then "Add to Home Screen"
        <span role="img" aria-label="plus icon">
          {" "}
          ➕{" "}
        </span>
        .
      </p>
    </div>
  );
}
