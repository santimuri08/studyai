import type { Metadata } from "next";
import { Sora, DM_Sans } from "next/font/google";
import "./globals.css";
import TransitionLayout from "@/components/TransitionLayout";
import GlobalBackground from "@/components/GlobalBackground";

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sora",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "StudyAI — Study Smarter",
  description: "AI-powered academic productivity platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sora.variable} ${dmSans.variable}`}>
      <body
        style={{
          background: "var(--bg)",
          color: "var(--text)",
          margin: 0,
          padding: 0,
          overflowX: "hidden",
          fontFamily: "var(--font-dm-sans), 'DM Sans', -apple-system, sans-serif",
        }}
      >
        <GlobalBackground />
        <div style={{ position: "relative", zIndex: 1 }}>
          <TransitionLayout>
            {children}
          </TransitionLayout>
        </div>
      </body>
    </html>
  );
}