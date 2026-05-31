import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ai-genius-rho.vercel.app"),
  title: {
    default: "AiGenius Pet Learning System",
    template: "%s | AiGenius Pet Learning System",
  },
  description:
    "A mobile-first English learning gamification system for AiGenius Tuition Centre, with daily learning, pet growth, exploration, rewards, and parent progress reports.",
  applicationName: "AiGenius Pet Learning System",
  keywords: [
    "AiGenius Tuition Centre",
    "English learning",
    "pet learning system",
    "gamified learning",
    "CEFR English",
    "tuition centre",
  ],
  authors: [{ name: "AiGenius Tuition Centre" }],
  creator: "AiGenius Tuition Centre",
  publisher: "AiGenius Tuition Centre",
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/aigenius-logo.png", type: "image/png" },
    ],
    apple: [{ url: "/aigenius-logo.png", type: "image/png" }],
    shortcut: ["/aigenius-logo.png"],
  },
  openGraph: {
    type: "website",
    locale: "en_MY",
    url: "https://ai-genius-rho.vercel.app",
    siteName: "AiGenius Pet Learning System",
    title: "AiGenius Pet Learning System",
    description:
      "A premium pet-based English learning platform for daily quests, rewards, exploration, blind boxes, and parent reports.",
    images: [
      {
        url: "/og-image.png",
        width: 1024,
        height: 1024,
        alt: "AiGenius Tuition Centre logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AiGenius Pet Learning System",
    description:
      "Daily English learning quests, pet growth, rewards, exploration, and parent progress reports for AiGenius Tuition Centre.",
    images: ["/og-image.png"],
  },
  appleWebApp: {
    capable: true,
    title: "AiGenius",
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
