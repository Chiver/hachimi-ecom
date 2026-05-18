import type { Metadata } from "next";
import "./globals.css";
import { TopNav } from "@/components/nav/TopNav";

export const metadata: Metadata = {
  title: "Hachimi 全球电商研究",
  description:
    "32 国 × 12 品类全球跨境电商市场调研。所有数据可追溯。",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className="h-full antialiased dark">
      <body className="min-h-screen flex flex-col">
        <TopNav />
        <main className="flex-1 min-h-0">{children}</main>
      </body>
    </html>
  );
}
