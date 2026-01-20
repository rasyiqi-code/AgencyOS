import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StackTheme, StackProvider } from "@stackframe/stack";
import { stackServerApp } from "@/lib/stack";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Agency OS",
  description: "SoloDev Async Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StackProvider app={stackServerApp}>
          <StackTheme>
            {children}
            <Toaster />
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
