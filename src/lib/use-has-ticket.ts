import { useEffect, useState } from "react";

const STORAGE_KEY = "tedx-ticket-token";

// Returns true once the component has mounted AND the visitor has a
// previously-activated ticket token saved on this device. Always false
// during SSR / pre-hydration so server HTML never leaks ticket-only UI.
export function useHasTicket(): boolean {
  const [hasTicket, setHasTicket] = useState(false);
  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY)) setHasTicket(true);
    } catch {
      // ignore (private mode / storage disabled)
    }
  }, []);
  return hasTicket;
}
