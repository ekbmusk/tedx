"use client";

import { useEffect } from "react";

// When the ticket page shows "not found" but localStorage still remembers
// this exact token, the row was likely deleted server-side (or the link is
// stale). Clear it so the landing's "Менің билетім" pill + private Schedule
// section stop showing up on the next reload.
export function ClearStaleToken({ token }: { token: string }) {
  useEffect(() => {
    try {
      if (localStorage.getItem("tedx-ticket-token") === token) {
        localStorage.removeItem("tedx-ticket-token");
      }
    } catch {
      // ignore
    }
  }, [token]);
  return null;
}
