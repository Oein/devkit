import { ContinuelProvider } from "../lib";
import type { AppProps } from "next/app";
import "../styles/globals.css";

/**
 * Example Next.js App component with ContinuelProvider
 * This shows how to set up the context provider at the app level
 */
export default function App({ Component, pageProps }: AppProps) {
  return (
    <ContinuelProvider baseUrl={process.env.NEXT_PUBLIC_BACKEND_URL}>
      <Component {...pageProps} />
    </ContinuelProvider>
  );
}
