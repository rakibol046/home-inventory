import { api } from "./client";
import type { User } from "@/types";

export const getMe = async (): Promise<User> => {
  const { data } = await api.get("/v1/users/me");
  return data;
};

export const updateMe = async (payload: { full_name?: string; avatar_url?: string }): Promise<User> => {
  const { data } = await api.patch("/v1/users/me", payload);
  return data;
};
