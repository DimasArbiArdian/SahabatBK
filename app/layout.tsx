import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import LayoutWrapper from "@/components/layout-wrapper"; // Import wrapper baru

const inter = Inter({ subsets: ["latin"] });

// const poppins = Poppins({
//   subsets: ["latin"],
//   weight: ["400", "600", "700"],
//   style: ["normal"],
//   display: "swap",
//   variable: "--font-poppins",
// });

export const metadata: Metadata = {
  title: "Sahabat BK",
  description: "Sahabat BK",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={inter.className}>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
