import { api } from "./client";
import type { Label } from "@/types";

export const fetchLabels = async (): Promise<Label[]> => {
  const { data } = await api.get("/v1/labels");
  return data;
};

export const createLabel = async (payload: {
  name: string;
  color_bg?: string;
  color_text?: string;
}): Promise<Label> => {
  const { data } = await api.post("/v1/labels", payload);
  return data;
};

export const updateLabel = async (
  id: string,
  payload: { name?: string; color_bg?: string; color_text?: string }
): Promise<Label> => {
  const { data } = await api.patch(`/v1/labels/${id}`, payload);
  return data;
};

export const deleteLabel = async (id: string): Promise<void> => {
  await api.delete(`/v1/labels/${id}`);
};
