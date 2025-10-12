import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Validador de Emails - GO Observatorio y Datos",
  description:
    "Herramienta institucional para validar y normalizar listas de correos electrónicos según mejores prácticas de entregabilidad. Desarrollado por la GO Observatorio y Datos.",
  keywords: ["validador", "emails", "gcba", "observatorio y datos", "buenos aires", "gobierno de la ciudad"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-AR" className={archivo.variable}>
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}


