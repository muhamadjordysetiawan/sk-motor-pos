import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: `${APP_NAME} — ${APP_TAGLINE} · Point of Sale & Management System`,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${geist.className} antialiased`}>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
