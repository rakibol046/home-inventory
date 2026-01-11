import { api } from "./client";

export const fetchLocations = async () => {
  const { data } = await api.get("/v1/locations");
  return data;
};
