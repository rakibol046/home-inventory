import { api } from "./client";

export const loginUser = async (payload: {
  username: string;
  password: string;
  rememberMe?: boolean;
}) => {
  console.log("Logging in with payload:", payload);
  const { data } = await api.post("/v1/users/login", payload);
  return data;
};
