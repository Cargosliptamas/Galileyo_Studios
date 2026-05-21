export interface CastMember {
  id: string;
  name: string;
  role: string;
  status: "confirmed" | "pending";
  bio?: string;
  galileyoVerified?: boolean;
  galileyoHandle?: string;
}

export interface CrewMember {
  id: string;
  name: string;
  role: string;
  status: "confirmed" | "pending";
}

// Landing page strip uses this short list. Names locked in writing only.
export const CAST_PREVIEW: CastMember[] = [
  {
    id: "brett-camrites",
    name: "Brett Camrites",
    role: "The Soldier",
    status: "confirmed",
  },
  { id: "lead-2", name: "Cast Name 2", role: "The Girl", status: "pending" },
  { id: "lead-3", name: "Cast Name 3", role: "The Brother", status: "pending" },
  {
    id: "lead-4",
    name: "Cast Name 4",
    role: "The Captain",
    status: "pending",
  },
  {
    id: "creator-1",
    name: "Brett Miller",
    role: "Co-Creator",
    status: "confirmed",
  },
  {
    id: "creator-2",
    name: "Brett Raio",
    role: "Co-Creator",
    status: "confirmed",
  },
];

// TODO(brett-miller): confirm full cast with each actor's agent and update
// status to "confirmed" with bios once signed.
export const CAST_FULL: CastMember[] = [
  {
    id: "brett-camrites",
    name: "Brett Camrites",
    role: "Lead. The Soldier.",
    status: "confirmed",
    bio: "Marine veteran and actor. Full bio lands once headshots are approved.",
    galileyoVerified: false,
  },
  {
    id: "lead-2",
    name: "Cast Name 2",
    role: "Co-Lead. The Girl.",
    status: "pending",
  },
  {
    id: "lead-3",
    name: "Cast Name 3",
    role: "Supporting. The Brother.",
    status: "pending",
  },
  {
    id: "lead-4",
    name: "Cast Name 4",
    role: "Supporting. The Captain.",
    status: "pending",
  },
];

// TODO(brett-miller): confirm crew before publishing. Add music supervisor,
// VFX lead, and the Kling AI credit attribution per the licensing agreement.
export const CREW: CrewMember[] = [
  {
    id: "brett-miller",
    name: "Brett Miller",
    role: "Co-Creator, Director",
    status: "confirmed",
  },
  {
    id: "brett-raio",
    name: "Brett Raio",
    role: "Co-Creator, Executive Producer",
    status: "confirmed",
  },
  {
    id: "music-supervisor",
    name: "TBC",
    role: "Music Supervisor",
    status: "pending",
  },
  {
    id: "dp",
    name: "TBC",
    role: "Director of Photography",
    status: "pending",
  },
  {
    id: "editor",
    name: "TBC",
    role: "Editor",
    status: "pending",
  },
  {
    id: "vfx-lead",
    name: "TBC",
    role: "VFX Lead",
    status: "pending",
  },
];
