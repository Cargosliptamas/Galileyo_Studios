export interface Sponsor {
  id: string;
  name: string;
  status: "confirmed" | "pitched" | "placeholder";
}

export interface AffiliateOffer {
  id: string;
  name: string;
  category: string;
  discountLine: string;
  description: string;
  href: string;
  featured?: boolean;
}

export const SPONSORS: Sponsor[] = [
  { id: "bivystick", name: "BivyStick", status: "confirmed" },
  { id: "seekins", name: "Seekins", status: "confirmed" },
  { id: "moonshine", name: "Moonshine", status: "confirmed" },
  { id: "open-1", name: "Your Brand", status: "placeholder" },
  { id: "open-2", name: "Your Brand", status: "placeholder" },
  { id: "open-3", name: "Your Brand", status: "placeholder" },
];

// TODO(brett-miller): replace placeholder `.example` URLs with the live
// affiliate links once each partner ships their tracking code.
export const AFFILIATE_OFFERS: AffiliateOffer[] = [
  {
    id: "escape-zone",
    name: "Escape Zone",
    category: "Backpacks",
    discountLine: "20% off",
    description:
      "Bug-out and every-day-carry packs built for people who actually move.",
    href: "https://escapezone.example/galileyo",
    featured: true,
  },
  {
    id: "ghost-phone",
    name: "Ghost Phone",
    category: "Privacy hardware",
    discountLine: "$200 off",
    description:
      "Hardened mobile device with private comms. Two grand list, ours for less.",
    href: "https://ghostphone.example/galileyo",
    featured: true,
  },
  {
    id: "bivystick",
    name: "BivyStick",
    category: "Off-grid comms",
    discountLine: "15% off",
    description:
      "Satellite SOS and two-way messaging when the towers are down.",
    href: "https://bivystick.example/galileyo",
  },
  {
    id: "seekins",
    name: "Seekins",
    category: "Precision rifles",
    discountLine: "10% off",
    description:
      "American-built precision rifles. The kind you hand down with the truck.",
    href: "https://seekins.example/galileyo",
  },
  {
    id: "moonshine",
    name: "Moonshine",
    category: "Spirits",
    discountLine: "Free shipping",
    description:
      "Small-batch spirits. Drink with people you would call at 3am.",
    href: "https://moonshine.example/galileyo",
  },
  {
    id: "freedom-coffee",
    name: "Freedom Coffee",
    category: "Coffee",
    discountLine: "15% off subscription",
    description:
      "Fresh roast every two weeks. Cancel any time, but you will not.",
    href: "https://freedomcoffee.example/galileyo",
  },
];
