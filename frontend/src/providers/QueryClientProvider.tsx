import { QueryClientProvider as TanstackQueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../config/queryClient";

export default function QueryClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <TanstackQueryClientProvider client={queryClient}>
      {children}
    </TanstackQueryClientProvider>
  )
}