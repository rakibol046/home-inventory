import { api } from "./client";
import type { Item, ItemDetail, PaginatedResponse, Warranty } from "@/types";

export interface ItemsQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  location_id?: string;
  category_id?: string;
  label_id?: string;
  sort_by?: string;
}

export const fetchItems = async (params: ItemsQueryParams = {}): Promise<PaginatedResponse<Item>> => {
  const { data } = await api.get("/v1/items", { params });
  return data;
};

export const fetchItemById = async (id: string): Promise<ItemDetail> => {
  const { data } = await api.get(`/v1/items/${id}`);
  return data;
};

export const createItem = async (payload: {
  name: string;
  brand?: string;
  model_number?: string;
  serial_number?: string;
  color?: string;
  condition?: string;
  quantity?: number;
  notes?: string;
  is_insured?: boolean;
  location_id?: string | null;
  category_id?: string | null;
  label_ids?: string[];
  purchase_price?: number | null;
  purchase_date?: string | null;
  purchased_from?: string | null;
}): Promise<ItemDetail> => {
  const { data } = await api.post("/v1/items", payload);
  return data;
};

export const updateItem = async (
  id: string,
  payload: Partial<Parameters<typeof createItem>[0]>
): Promise<ItemDetail> => {
  const { data } = await api.patch(`/v1/items/${id}`, payload);
  return data;
};

export const deleteItem = async (id: string): Promise<void> => {
  await api.delete(`/v1/items/${id}`);
};

export const uploadItemImage = async (id: string, file: File): Promise<{ url: string; id: string }> => {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post(`/v1/items/${id}/images`, formData);
  return data;
};

export const deleteItemImage = async (itemId: string, imageId: string): Promise<void> => {
  await api.delete(`/v1/items/${itemId}/images/${imageId}`);
};

export const getItemWarranty = async (id: string): Promise<Warranty> => {
  const { data } = await api.get(`/v1/items/${id}/warranty`);
  return data;
};

export const createItemWarranty = async (
  id: string,
  payload: { provider?: string; warranty_type?: string; start_date?: string; end_date?: string; notes?: string }
): Promise<Warranty> => {
  const { data } = await api.post(`/v1/items/${id}/warranty`, payload);
  return data;
};

export const updateItemWarranty = async (
  id: string,
  payload: { provider?: string; warranty_type?: string; start_date?: string; end_date?: string; notes?: string }
): Promise<Warranty> => {
  const { data } = await api.patch(`/v1/items/${id}/warranty`, payload);
  return data;
};

export const exportItems = () => {
  const token = localStorage.getItem("token");
  const url = `http://localhost:8080/api/v1/items/export?format=csv`;
  fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    .then((r) => r.blob())
    .then((blob) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "inventory.csv";
      a.click();
    });
};
