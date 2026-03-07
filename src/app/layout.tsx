import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "F1 Experience",
  description: "Multi-screen Formula 1 immersive experience",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-f1-dark text-f1-light antialiased">
        {children}
      </body>
    </html>
  );
}
