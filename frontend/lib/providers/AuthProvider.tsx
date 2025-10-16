import React, { ReactNode, useState } from "react";
import { Auth, AuthContext } from "../hooks/useAuth";
import useContinuel from "../hooks/useContinuel";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const continuel = useContinuel();
  const [auth, setAuth] = useState<Auth>({
    async signin(props) {
      const response = await continuel.auth.signin(props);
      setAuth((prev) => ({ ...prev, signedIn: response.success }));
      return response;
    },
    async signout() {
      const response = await continuel.auth.signout();
      setAuth((prev) => ({ ...prev, signedIn: false }));
      return response;
    },
    async signup(props) {
      const response = await continuel.auth.signup(props);
      setAuth((prev) => ({ ...prev, signedIn: true }));
      return response;
    },
  });

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
