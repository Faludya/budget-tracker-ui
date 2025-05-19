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

  const fetchFilteredTransactions = useCallback(async (filters) => {
    try {
      const userId = localStorage.getItem("userId");

      const params = {
        fromDate: filters.fromDate?.toISOString(),
        toDate: filters.toDate?.toISOString(),
        type: filters.type || undefined,
        categoryId: filters.categoryId || undefined,
        amountMin: filters.amountMin || undefined,
        amountMax: filters.amountMax || undefined,
      };

      const res = await apiClient.get("/transactions/filtered", {
        params,
        headers: { userId },
      });

      setTransactions(res.data);
    } catch (err) {
      console.error("Failed to fetch filtered transactions", err);
    }
  }, []);

  return {
    transactions,
    setTransactions,
    fetchTransactions,
    fetchFilteredTransactions, 
  };
};

export default useTransactions;
