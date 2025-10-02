import type { AppProps } from "next/app";
import "./globals.css";
import { NavigationHeader } from "@/components/NavigationHeader";
import { ThemeProvider } from "next-themes";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <NavigationHeader />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
