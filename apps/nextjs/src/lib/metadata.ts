import type { Metadata } from "next";

type TitleString = Metadata["title"];

export function getTitle(title: TitleString[]) {
  const titleString: string[] = title.map((t) => {
    if (t && typeof t === "object" && "absolute" in t) {
      return t.absolute;
    }

    if (t && typeof t === "object" && "template" in t) {
      return t.template;
    }

    return t ?? "";
  });

  return titleString.filter(Boolean).join(" | ");
}
