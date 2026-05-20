export interface CastMember {
  id: string;
  name: string;
  role: string;
  status: "confirmed" | "pending";
}

export const CAST_PREVIEW: CastMember[] = [
  { id: "lead-1", name: "Cast Name 1", role: "The Soldier", status: "pending" },
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
