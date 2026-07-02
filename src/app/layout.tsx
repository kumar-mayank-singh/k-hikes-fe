import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "./providers/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { fontHeading, fontSans } from "@/styles/fonts";
import { AuthProvider } from "./providers/auth-provider";

export const metadata: Metadata = {
  title: "Karnataka Hikes - Treks & Adventures",
  description:
    "Discover handpicked treks and hikes. From misty peaks to deep forests, find your next adventure.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontHeading.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased" suppressHydrationWarning>
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
