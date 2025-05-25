import { useState } from "react";
import { api, setAuthToken } from "../utils/api";

export const useAuth = () => {
  const [user, setUser] = useState(null);

  const login = async (username: string, password: string) => {
    const response = await api.post("users/login", { username, password });
    localStorage.setItem("token", response.data.access_token);
    localStorage.setItem("user_id", response.data.userId);
    setAuthToken(response.data.access_token);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setAuthToken(null);
    
  };

  return { user, login, logout };
};
