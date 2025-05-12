import { createContext, useContext, useEffect, useState } from "react";
import apiClient from "../api/axiosConfig";

const UserPreferencesContext = createContext();

export const UserPreferencesProvider = ({ children }) => {
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPreferences = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const res = await apiClient.get("/userpreferences", { headers: { userId } });
      setPreferences(res.data);
    } catch (err) {
      console.error("Failed to fetch user preferences:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  return (
    <UserPreferencesContext.Provider value={{ preferences, setPreferences, loading }}>
      {children}
    </UserPreferencesContext.Provider>
  );
};

export const useUserPreferences = () => useContext(UserPreferencesContext);
