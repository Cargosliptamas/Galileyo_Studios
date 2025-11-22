import type { Alert } from "@galileyo/validators";

export interface MapData {
  latitude: number;
  longitude: number;
  alert?: Alert;
}
