import { AppProps } from "next/app";
import "@/app/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Script from "next/script";
import { TempoInit } from "@/components/tempo-init";
import ErrorBoundary from "@/components/error-boundary";
import NotFoundBoundary from "@/components/not-found-boundary";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Script
        src="https://api.tempolabs.ai/proxy-asset?url=https://storage.googleapis.com/tempo-public-assets/error-handling.js"
        strategy="beforeInteractive"
      />
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ErrorBoundary>
          <NotFoundBoundary>
            <Component {...pageProps} />
          </NotFoundBoundary>
        </ErrorBoundary>
        <TempoInit />
      </ThemeProvider>
    </>
  );
}

export default MyApp;
