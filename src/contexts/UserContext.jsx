import { createContext, useContext, useEffect, useState } from "react";
import apiClient from "../api/axiosConfig";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserAndPreferences = async () => {
    try {
      const userId = localStorage.getItem("userId");

      const [userRes, preferencesRes] = await Promise.all([
        apiClient.get("/users/user-profile", { headers: { userId } }),
        apiClient.get("/userpreferences", { headers: { userId } }),
      ]);

      setUser(userRes.data);
      setPreferences(preferencesRes.data);
    } catch (err) {
      console.error("Failed to fetch user or preferences:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (updatedUser) => {
    try {
      const userId = localStorage.getItem("userId");
      await apiClient.put("/users/user-profile", updatedUser, {
        headers: { userId },
      });
      setUser(updatedUser);
      return { success: true };
    } catch (err) {
      console.error("Failed to update user:", err);
      return { success: false, error: err };
    }
  };

  const updatePreferences = async (updatedPrefs) => {
    try {
      const userId = localStorage.getItem("userId");
      await apiClient.put("/userpreferences", updatedPrefs, {
        headers: { userId },
      });
      setPreferences(updatedPrefs);
      return { success: true };
    } catch (err) {
      console.error("Failed to update preferences:", err);
      return { success: false, error: err };
    }
  };

  useEffect(() => {
    fetchUserAndPreferences();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        preferences,
        setPreferences,
        loading,
        fetchUserAndPreferences,
        updateUser,             // ✅ New
        updatePreferences,      // ✅ New
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
