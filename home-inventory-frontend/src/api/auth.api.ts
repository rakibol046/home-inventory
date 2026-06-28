import { api } from "./client";

export const loginUser = async (payload: {
  username: string;
  password: string;
  rememberMe?: boolean;
}) => {
  const { data } = await api.post("/v1/users/login", payload);
  localStorage.setItem("token", data.token);
  if (data.refresh_token) localStorage.setItem("refreshToken", data.refresh_token);
  return data;
};

export const registerUser = async (payload: {
  email: string;
  username: string;
  password: string;
  full_name?: string;
}) => {
  const { data } = await api.post("/v1/users/register", payload);
  localStorage.setItem("token", data.token);
  if (data.refresh_token) localStorage.setItem("refreshToken", data.refresh_token);
  return data;
};

export const logoutUser = async (refreshToken?: string) => {
  const token = refreshToken || localStorage.getItem("refreshToken") || "";
  if (token) {
    try {
      await api.post("/v1/auth/logout", { refresh_token: token });
    } catch {}
  }
};
