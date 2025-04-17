import type { Metadata } from "next";
import { IBM_Plex_Sans, Libre_Baskerville } from "next/font/google";
import "./globals.css";
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const ibmPlexSans = IBM_Plex_Sans({
  weight: ['400', '600', '700'],
  subsets: ["latin"],
  variable: "--font-ibm-plex-sans",
});

const libreBaskerville = Libre_Baskerville({
  weight: ['400', '700'],
  subsets: ["latin"],
  variable: "--font-libre-baskerville",
});

export const metadata: Metadata = {
  title: "Clio-X - Open-Source Framework for Industrial AI & Data Economy",
  description: "The largest publicly available X-Ecosystem, powered by smart contracts and Gaia-X",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${ibmPlexSans.variable} ${libreBaskerville.variable} antialiased`}>
        <Header />
        <main>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
