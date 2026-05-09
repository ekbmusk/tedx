"use client";

import { useEffect } from "react";

const STORAGE_KEY = "tedx-ticket-token";

export function RememberTicket({ token }: { token: string }) {
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, token);
    } catch {
      // localStorage may be unavailable (private mode, disabled storage)
    }
  }, [token]);
  return null;
}
