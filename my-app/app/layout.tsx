import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
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
  title: "Grocery Deal Hunter",
  description: "Explore neighborhood grocery stores and plan your shopping.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a className="skip-link" href="#main-content">Skip to content</a>
        <header className="site-header"><nav className="site-nav" aria-label="Main navigation">
          <Link className="brand" href="/" aria-label="Grocery Deal Hunter home"><Image className="brand-logo" src="/GroceryLogo_files/Logo.png" alt="Grocery Deal Hunter" width={1536} height={1024} sizes="180px" /></Link>
          <div className="nav-links"><Link href="/shoppinglist">My list</Link><Link href="/saved">Saved</Link><Link className="nav-login" href="/login">Log in ↗</Link></div>
        </nav></header>
        {children}
        <footer className="site-footer"><span>Good groceries. Better everyday choices.</span><span>Grocery Deal Hunter · Fictional demo prices</span></footer>
      </body>
    </html>
  );
}
