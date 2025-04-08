import "./globals.css";
import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

// Configurar la fuente
const IBMPlex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex",
  display: "swap",
});

// Metadatos de la aplicación
export const metadata: Metadata = {
  title: "Imaginify",
  description: "Transforma imágenes con IA",
};

// Componente raíz
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: "dark", // O "light", o quitarlo para usar tema automático
      }}
    >
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
