import "./globals.css";
import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes"; // 👈 Importa el tema correcto
import { cn } from "@/lib/utils";

// Fuente Google
const IBMPlex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex",
  display: "swap",
});

// Metadata
export const metadata: Metadata = {
  title: "Imaginify",
  description: "Transforma imágenes con IA",
};

// Layout principal
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <html lang="en" suppressHydrationWarning>
        <body
          className={cn(
            "min-h-screen font-IBMPlex antialiased",
            IBMPlex.variable,
            "bg-white dark:bg-gray-900"
          )}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
