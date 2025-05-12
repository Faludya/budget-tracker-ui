import React, { createContext, useContext, useState, useCallback } from "react";
import apiClient from "../api/axiosConfig";

const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);

  const fetchTransactions = useCallback(async () => {
    try {
      const userId = localStorage.getItem("userId");
      const res = await apiClient.get("/transactions", {
        headers: { userId }
      });
      setTransactions(res.data);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    }
  }, []);

  return (
    <TransactionContext.Provider value={{ transactions, setTransactions, fetchTransactions }}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactionContext = () => useContext(TransactionContext);
