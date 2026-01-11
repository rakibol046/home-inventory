import { api } from "./client";

export const fetchItems = async () => {
  const { data } = await api.get("/v1/items?page=1&pageSize=1");
  return data;
};

export const fetchItemById = async (id: string) => {
  const { data } = await api.get(`/v1/items/${id}`);
  return data;
};
