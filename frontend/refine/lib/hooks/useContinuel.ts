import { createContext, useContext } from "react";
import Continuel from "continuel";

// Context for providing Continuel instance through React context
export const ContinuelContext = createContext<Continuel | null>(null);

/**
 * React hook to access Continuel from context
 * Throws error if used outside of ContinuelProvider
 * @returns Continuel instance with auth and utils
 */
export function useContinuel(): Continuel {
  const continuel = useContext(ContinuelContext);

  if (!continuel) {
    throw new Error("useContinuel must be used within a ContinuelProvider");
  }

  return continuel;
}

/**
 * @deprecated Use useContinuel instead - they now have the same behavior
 */
export function useContinuelContext(): Continuel {
  return useContinuel();
}

// Default export for convenience
export default useContinuel;
