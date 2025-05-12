// hooks/useTransactions.js
import { useState, useCallback } from "react";
import apiClient from "../api/axiosConfig";

const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);

  const fetchTransactions = useCallback(async () => {
    try {
      const userId = localStorage.getItem("userId");
      const res = await apiClient.get("/transactions", {
        headers: { userId },
      });
      setTransactions(res.data);
    } catch (err) {
      console.error("Failed to fetch transactions", err);
    }
  }, []);

  return {
    transactions,
    setTransactions,
    fetchTransactions, 
  };
};

export default useTransactions;
