import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://maqconnect.cl"),
  title: {
    template: "%s | MaqConnect",
    default: "MaqConnect – Arriendo de Maquinaria Pesada en Chile",
  },
  description:
    "Encuentra y arrienda maquinaria pesada y operadores certificados en todo Chile. Excavadoras, bulldozers, cargadores frontales, retroexcavadoras y más.",
  keywords: [
    "arriendo maquinaria pesada",
    "maquinaria Chile",
    "operadores certificados",
    "excavadora arriendo",
    "bulldozer Chile",
    "retroexcavadora arriendo",
  ],
  authors: [{ name: "MaqConnect" }],
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: "https://maqconnect.cl",
    siteName: "MaqConnect",
    title: "MaqConnect – Arriendo de Maquinaria Pesada en Chile",
    description:
      "La plataforma líder para encontrar y arrendar maquinaria pesada y operadores certificados en todo Chile.",
  },
  twitter: {
    card: "summary_large_image",
    title: "MaqConnect – Arriendo de Maquinaria Pesada en Chile",
    description:
      "La plataforma líder para encontrar y arrendar maquinaria pesada y operadores certificados en todo Chile.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-CL" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
