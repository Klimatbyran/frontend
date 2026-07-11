export type HeroSearchResult =
  | { type: "company"; id: string; name: string }
  | { type: "municipality"; name: string }
  | { type: "region"; name: string }
  | { type: "nation"; name: string };
