import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OmniStock · Sistema de Control de Inventario y Perecederos (FEFO)",
  description: "Gestión avanzada de inventarios para supermercados y tiendas con trazabilidad de lotes, alertas de caducidad y control de góndola.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#F4F6F9] text-[#0F172A]">{children}</body>
    </html>
  );
}
