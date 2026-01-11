import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchItemById } from "../../api/items.api";

export default function ItemDetails() {
  const { id } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["item", id],
    queryFn: () => fetchItemById(id!),
  });

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <h1>{data.name}</h1>
      <p>Quantity: {data.quantity}</p>
    </div>
  );
}
