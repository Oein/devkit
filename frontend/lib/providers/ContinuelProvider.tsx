import React, { ReactNode, useMemo } from "react";
import Continuel from "@/lib/continuel";
import { ContinuelContext } from "../hooks/useContinuel";

interface ContinuelProviderProps {
  children: ReactNode;
  baseUrl?: string;
}

/**
 * React Context Provider for Continuel
 * Creates and provides a Continuel instance to all child components
 */
export function ContinuelProvider({
  children,
  baseUrl,
}: ContinuelProviderProps) {
  const continuel = useMemo(() => {
    const url =
      baseUrl ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.BACKEND_URL ||
      "http://localhost:4000";

    return new Continuel(url);
  }, [baseUrl]);

  return (
    <ContinuelContext.Provider value={continuel}>
      {children}
    </ContinuelContext.Provider>
  );
}

export default ContinuelProvider;
