import type { Metadata } from "next";
import { IBM_Plex_Mono, Sora } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "Carpool | Quiet Commutes",
  description: "A minimalist carpool platform for calm, shared rides.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sora.variable} ${ibmPlexMono.variable}`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
