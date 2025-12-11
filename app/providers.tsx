"use client";

import { CVIProvider } from "@/app/components/cvi/components/cvi-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return <CVIProvider>{children}</CVIProvider>;
}
