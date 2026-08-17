import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Minutas Publicas IA",
  description: "Gerador simples de minutas administrativas para gestao publica."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
