import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "N5Deal — Private market, made legible",
  description: "A secure marketplace for M&A opportunities and financial assets.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
