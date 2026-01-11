export const useAuth = () => {
  const login = (token: string) => {
    localStorage.setItem("token", token);
  };

  const logout = () => {
    localStorage.removeItem("token");
  };

  const isAuthenticated = !!localStorage.getItem("token");

  return { login, logout, isAuthenticated };
};
