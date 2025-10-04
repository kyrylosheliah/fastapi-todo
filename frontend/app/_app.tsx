import type { AppProps } from "next/app";
import "./globals.css";
import { NavigationHeader } from "@/components/NavigationHeader";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function NavigationWrapper({ Component, pageProps }: AppProps) {
  return (
    <>
      <NavigationHeader />
      <QueryClientProvider client={queryClient}>
        <div className="p-4 w-full h-full flex items-center justify-center">
          <div className="w-full h-full max-w-5xl">
            <Component {...pageProps} />
          </div>
        </div>
      </QueryClientProvider>
    </>
  );
}
