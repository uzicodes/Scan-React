import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const eaglore = localFont({
  src: "../../public/fonts/Eaglore.woff2",
  variable: "--font-eaglore",
});

const satoshi = localFont({
  src: "../../public/fonts/Satoshi.woff2",
  variable: "--font-satoshi",
});

const spaceGrotesk = localFont({
  src: "../../public/fonts/SpaceGrotesk.woff2",
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "Scan-React",
  description:
    "Paste a GitHub repository URL and get an instant React code quality diagnostic report. Automated static analysis and compiler-readiness checks.",
  icons: {
    icon: [
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: [
      { url: "/favicon/apple-touch-icon.png" },
    ],
  },
  manifest: "/favicon/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${eaglore.variable} ${satoshi.variable} ${spaceGrotesk.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
