import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgreeX - Contratos claros, pagos garantizados",
  description: "Plataforma todo-en-uno que genera, verifica, firma y custodia contratos inteligentes entre freelancers y contratantes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
