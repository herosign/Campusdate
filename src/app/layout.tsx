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
  title: {
    default: "Campus Date | Hyper-Localized College Dating",
    template: "%s | Campus Date",
  },
  description: "Join Campus Date, the exclusive hyper-localized dating and social platform for college students. Find your perfect match on campus safely and securely.",
  keywords: ["campus dating", "college dating", "university matchmaking", "student dating app", "Campus Date", "find a match on campus"],
  authors: [{ name: "Campus Date Team" }],
  creator: "Campus Date",
  publisher: "Campus Date",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://campusdate.vercel.app/", // Assuming vercel deployment
    title: "Campus Date | College Dating Reimagined",
    description: "The exclusive hyper-localized dating platform for college students. Find your match today.",
    siteName: "Campus Date",
  },
  twitter: {
    card: "summary_large_image",
    title: "Campus Date | College Dating Reimagined",
    description: "The exclusive hyper-localized dating platform for college students. Find your match today.",
  },
  alternates: {
    canonical: "https://campusdate.vercel.app/",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
