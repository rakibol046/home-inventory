import { api } from "./client";
import type { Category } from "@/types";

export const fetchCategories = async (): Promise<Category[]> => {
  const { data } = await api.get("/v1/categories");
  return data;
};

export const createCategory = async (payload: {
  name: string;
  color?: string;
  icon?: string;
  description?: string;
}): Promise<Category> => {
  const { data } = await api.post("/v1/categories", payload);
  return data;
};

export const updateCategory = async (
  id: string,
  payload: { name?: string; color?: string; icon?: string; description?: string }
): Promise<Category> => {
  const { data } = await api.patch(`/v1/categories/${id}`, payload);
  return data;
};

export const deleteCategory = async (id: string): Promise<void> => {
  await api.delete(`/v1/categories/${id}`);
};
