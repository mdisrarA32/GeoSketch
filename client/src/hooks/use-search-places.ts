import { useQuery } from "@tanstack/react-query";

interface NominatimResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: string[];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
}

export function useSearchPlaces(query: string) {
  return useQuery({
    queryKey: ["search-places", query],
    queryFn: async () => {
      if (!query || query.length < 3) return [];
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=5`,
        {
          headers: {
            "User-Agent": "ReplitGISDemo/1.0"
          }
        }
      );
      
      if (!response.ok) throw new Error("Search failed");
      return (await response.json()) as NominatimResult[];
    },
    enabled: query.length >= 3,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
