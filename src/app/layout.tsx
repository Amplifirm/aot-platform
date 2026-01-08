import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Sidebar, MobileHeader } from "@/components/layout/Sidebar";
import { TopHeader } from "@/components/layout/TopHeader";

const font = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "AOT - Accomplishments minus Offenses equals Total",
    template: "%s | AOT",
  },
  description:
    "A community platform for scoring and ranking People, Countries, and Ideas based on their Accomplishments and Offenses. A - O = T",
  keywords: [
    "scoring",
    "ranking",
    "accomplishments",
    "offenses",
    "people",
    "countries",
    "ideas",
    "community",
    "AOT",
  ],
  authors: [{ name: "AOT Community" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://aot.app",
    siteName: "AOT",
    title: "AOT - Accomplishments minus Offenses equals Total",
    description:
      "A community platform for scoring and ranking People, Countries, and Ideas based on their Accomplishments and Offenses.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AOT - A-O=T Scoring Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AOT - Accomplishments minus Offenses equals Total",
    description:
      "A community platform for scoring and ranking People, Countries, and Ideas.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${font.variable} font-sans antialiased`}>
        <ThemeProvider>
          <SessionProvider>
            {/* Animated background */}
            <div className="animated-bg" />
            <div className="grid-overlay dark:block hidden" />

            <div className="min-h-screen bg-background/80 backdrop-blur-sm relative">
              {/* Mobile Header - only visible on small screens */}
              <MobileHeader />

              <div className="flex">
                {/* Desktop Sidebar - hidden on mobile */}
                <Sidebar />

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-h-screen">
                  {/* Top Header - hidden on mobile */}
                  <TopHeader />

                  {/* Page Content */}
                  <main className="flex-1 p-6">
                    {children}
                  </main>
                </div>
              </div>
            </div>
            <Toaster position="bottom-right" />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
