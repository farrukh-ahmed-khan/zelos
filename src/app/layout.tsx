import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { Bebas_Neue, DM_Sans, Inter } from "next/font/google";
import "bootstrap/dist/css/bootstrap-grid.min.css";
import "./globals.css";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  weight: "400",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zelos",
  description: "Next.js App Router project with Tailwind CSS and Ant Design",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${bebasNeue.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <AntdRegistry>
          {children}
          <CookieConsentBanner />
        </AntdRegistry>
      </body>
    </html>
  );
}
