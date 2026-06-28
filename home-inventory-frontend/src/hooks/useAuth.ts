import { logoutUser } from "@/api/auth.api";

export const useAuth = () => {
  const isAuthenticated = !!localStorage.getItem("token");

  const login = (token: string, refreshToken?: string) => {
    localStorage.setItem("token", token);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
  };

  const logout = async () => {
    await logoutUser();
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    window.location.href = "/login";
  };

  return { login, logout, isAuthenticated };
};
