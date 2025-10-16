import type { AppProps } from "next/app";
import Head from "next/head";

import { ContinuelProvider } from "@/lib";

import "@/styles/globals.css";
import { OverlayProvider } from "@toss/use-overlay";

import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import AuthProvider from "@/lib/providers/AuthProvider";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Refine</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <meta name="description" content="Refine - A Next.js based framework" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ContinuelProvider>
          <AuthProvider>
            <OverlayProvider>
              <Component {...pageProps} />
              <Toaster position="bottom-right" duration={3000} />
            </OverlayProvider>
          </AuthProvider>
        </ContinuelProvider>
      </ThemeProvider>
    </>
  );
}
