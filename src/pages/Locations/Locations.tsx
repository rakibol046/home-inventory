import { useQuery } from "@tanstack/react-query";
import { fetchLocations } from "../../api/locations.api";

export default function Locations() {
  const { data, isLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: fetchLocations,
  });
  console.log("Fetched locations data:", data);

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Locations</h1>
      {data?.map((loc: any) => (
        <p key={loc.id}>{loc.name}</p>
      ))}
    </div>
  );
}
