import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ZoneSelector from "@/components/ZoneSelector";
import CatalogInitializer from "@/components/CatalogInitializer";
import FirebaseSync from "@/components/FirebaseSync";

import type { Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#001b62",
};

export const metadata: Metadata = {
  title: "Mi Negocio | Supermercado Online en Caracas",
  description:
    "Frutas, verduras, víveres y más directo a tu puerta. Delivery en Caracas con calidad garantizada. Pago seguro vía Zelle, Pago Móvil o Efectivo.",
  keywords: [
    "supermercado online",
    "mi negocio caracas",
    "delivery de frutas",
    "viveres delivery",
    "compras online venezuela",
    "supermercado caracas",
    "delivery caracas este",
  ],
  openGraph: {
    title: "Mi Negocio | Frescura hasta tu puerta",
    description:
      "Tu supermercado online de confianza en Caracas. Frutas, vegetales, víveres y más. ¡Haz tu pedido fácil y rápido!",
    url: "https://mi-negocio.ve/",
    siteName: "Mi Negocio",
    images: [
      {
        url: "https://raw.githubusercontent.com/jomstudiovzla/mi-negocio/main/frontend/public/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Mi Negocio – Supermercado Online Caracas",
      },
    ],
    locale: "es_VE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mi Negocio",
    description:
      "Frescura garantizada hasta la puerta de tu casa. Delivery rápido y seguro en Caracas.",
  },
  robots: "index, follow",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <FirebaseSync />
        <CatalogInitializer />
        <ZoneSelector />
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
