"use client";

import { useContext } from "react";
import { AccountContext } from "@/context/AccountContext";

export function useAccount() {
  const context = useContext(AccountContext);

  if (!context) {
    throw new Error("useAccount must be used inside AccountProvider");
  }

  return context;
}