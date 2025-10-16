import { createContext, useContext } from "react";
import { AuthResponse, SigninRequest, SignupRequest } from "../continuel";

export type Auth = {
  signedIn?: boolean;
  signin: (props: SigninRequest) => Promise<AuthResponse>;
  signout: () => Promise<AuthResponse>;
  signup: (props: SignupRequest) => Promise<AuthResponse>;
};

// Context for providing Continuel instance through React context
export const AuthContext = createContext<Auth | null>(null);

/**
 * React hook to access Continuel from context
 * Throws error if used outside of ContinuelProvider
 * @returns Continuel instance with auth and utils
 */
export function useAuth(): Auth {
  const auth = useContext(AuthContext);

  if (!auth) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return auth;
}

export default useAuth;
