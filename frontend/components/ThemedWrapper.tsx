"use client";

import { NavigationHeader } from "@/components/NavigationHeader";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import dynamic from "next/dynamic"

const NextThemesProvider = dynamic(
  () => import("next-themes").then((e) => e.ThemeProvider),
  {
    ssr: false,
  },
)

export function ThemedProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

export default function ThemedWrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient();

  return (
    <ThemedProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <NavigationHeader />
      <QueryClientProvider client={queryClient}>
        <div className="p-4 w-full h-full flex items-center justify-center">
          <div className="w-full h-full max-w-5xl">{children}</div>
        </div>
      </QueryClientProvider>
    </ThemedProvider>
  );
}