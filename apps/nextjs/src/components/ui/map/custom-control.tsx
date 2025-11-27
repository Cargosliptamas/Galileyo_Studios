"use client";

import type { PropsWithChildren, ReactNode } from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface CustomControlProps {
  position: keyof typeof controlPositions;
}

const controlPositions = {
  topLeft: ".maplibregl-ctrl-top-left",
  topRight: ".maplibregl-ctrl-top-right",
  bottomLeft: ".maplibregl-ctrl-bottom-left",
  bottomRight: ".maplibregl-ctrl-bottom-right",
};

export const CustomControl = ({
  position,
  children,
}: PropsWithChildren<CustomControlProps>) => {
  const [groupContainer, setGroupContainer] = useState<HTMLDivElement | null>(
    null,
  );

  useEffect(() => {
    const parentElement = document.querySelector(controlPositions[position]);
    const groupDiv = document.createElement("div");

    if (parentElement) {
      groupDiv.classList.add("maplibregl-ctrl", "maplibregl-ctrl-group");

      setGroupContainer(groupDiv);
      parentElement.appendChild(groupDiv);
    }

    return () => {
      if (parentElement) {
        parentElement.removeChild(groupDiv);
      }
    };
  }, []);

  if (!groupContainer) return null;

  return createPortal(<>{children}</>, groupContainer);
};

interface DefaultButtonProps {
  title: string;
  onClick: () => void;
  icon: () => ReactNode;
}

const DefaultButton = ({ title, onClick, icon }: DefaultButtonProps) => {
  return (
    <button type="button" aria-label={title} title={title} onClick={onClick}>
      <span className="flex items-center justify-center" aria-hidden={true}>
        {icon()}
      </span>
    </button>
  );
};

CustomControl.DeafultButton = DefaultButton;
