// /src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext"; // Caminho corrigido
// import { ThemeProvider } from "../components/theme-provider"; // Mantido comentado

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cardápio Digital SaaS",
  description: "Plataforma de cardápio digital para restaurantes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          {/* ThemeProvider continua comentado */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
