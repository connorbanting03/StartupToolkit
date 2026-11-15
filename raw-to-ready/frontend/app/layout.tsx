import type { Metadata } from "next";
import { DM_Sans, Syne } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { SWRProvider } from "@/lib/swr-provider";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "StartupToolkit — Plan, build, and launch your business",
  description:
    "Business planning tools that help founders plan, build, and launch. Financial calculators, supplier matrices, pricing tools, and smart recommendations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${syne.variable} ${dmSans.variable} font-body antialiased bg-charcoal text-cream`}
      >
        <AuthProvider>
          <SWRProvider>
            <div className="relative z-10 min-h-screen">{children}</div>
          </SWRProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
