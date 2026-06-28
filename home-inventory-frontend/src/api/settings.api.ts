import { api } from "./client";
import type { Settings } from "@/types";

export const fetchSettings = async (): Promise<Settings> => {
  const { data } = await api.get("/v1/settings");
  return data;
};

export const updateSettings = async (payload: Partial<Settings>): Promise<Settings> => {
  const { data } = await api.patch("/v1/settings", payload);
  return data;
};
