export interface CastMember {
  id: string;
  name: string;
  role: string;
  status: "confirmed" | "pending";
  bio?: string;
  // Path to a properly licensed headshot, e.g. "/studios/cast/cameron-bright.jpg".
  // Leave undefined until the actor's rep provides the photo plus written
  // permission to use it on the platform. The UI renders an initial-monogram
  // placeholder when this is absent.
  photo?: string;
  imdbUrl?: string;
  galileyoVerified?: boolean;
  galileyoHandle?: string;
}

export interface CrewMember {
  id: string;
  name: string;
  role: string;
  status: "confirmed" | "pending";
}

// Episode 1 voiceover cast. Confirmed performers only. Character names are
// withheld until they are locked, so each is credited as "Voiceover Cast".
// Headshots are intentionally omitted until each actor's rep supplies a
// licensed image with written permission to display it.
export const CAST_PREVIEW: CastMember[] = [
  {
    id: "cameron-bright",
    name: "Cameron Bright",
    role: "Voiceover Cast",
    status: "confirmed",
    imdbUrl: "https://www.imdb.com/name/nm1080974/",
  },
  {
    id: "jennifer-marshall",
    name: "Jennifer Marshall",
    role: "Voiceover Cast",
    status: "confirmed",
    imdbUrl: "https://www.imdb.com/name/nm1351148/",
  },
];

// Full cast detail surface. Mirrors CAST_PREVIEW for now; expand with character
// names and bios once each is locked in writing.
export const CAST_FULL: CastMember[] = [
  {
    id: "cameron-bright",
    name: "Cameron Bright",
    role: "Voiceover Cast",
    status: "confirmed",
    imdbUrl: "https://www.imdb.com/name/nm1080974/",
  },
  {
    id: "jennifer-marshall",
    name: "Jennifer Marshall",
    role: "Voiceover Cast",
    status: "confirmed",
    imdbUrl: "https://www.imdb.com/name/nm1351148/",
  },
];

// Film crew. Brett Miller is the producer and director of the film. Brett Raio
// is the developer of the Galileyo platform (BOLD Studios) and is intentionally
// not listed in the film credits. Remaining roles are confirmed in writing
// before publishing.
export const CREW: CrewMember[] = [
  {
    id: "brett-miller",
    name: "Brett Miller",
    role: "Producer, Director",
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
