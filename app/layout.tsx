import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://sendtoolkit.com"),
  title: {
    default: "SendToolkit | What to say when a client situation turns into a problem",
    template: "%s | SendToolkit"
  },
  description: "Client communication systems for uncomfortable client conversations.",
  openGraph: {
    title: "SendToolkit",
    description: "The response system for uncomfortable client conversations.",
    type: "website",
    url: "https://sendtoolkit.com"
  }
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
