import { WorldMap } from "@/components/map/WorldMap";
import { getAllCountries } from "@/lib/data";
import { getCountryScoreSummaries } from "@/lib/scores";

export default function HomePage() {
  const countries = getAllCountries();
  const scores = getCountryScoreSummaries();
  return (
    <div className="h-[calc(100vh-3.5rem)] w-full">
      <WorldMap countries={countries} scores={scores} />
    </div>
  );
}
