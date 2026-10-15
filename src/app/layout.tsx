import type { Metadata, Viewport } from "next";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import OffscreenPause from "@/components/OffscreenPause";
import SmoothScroll from "@/components/SmoothScroll";
import CookieBanner from "@/components/CookieBanner";
import { OG_VERSION, SITE_NAME, SITE_URL } from "@/lib/seo";
import { LEGAL } from "@/lib/site";
import { brand, display, text } from "./fonts";
import "./globals.css";

const DESCRIPTION =
  "Every request from employees and AI agents to AI models goes through one gateway inside your network: personal data is masked, access and model spend stay under control.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Kordon AI — the enterprise AI gateway inside your network",
    template: "%s · Kordon AI",
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: SITE_NAME,
    images: [{ url: `/og/home.png?v=${OG_VERSION}`, width: 1200, height: 630, alt: "Kordon AI — security that pays for itself" }],
  },
  twitter: { card: "summary_large_image", images: [`/og/home.png?v=${OG_VERSION}`] },
};

/* Schema.org markup: who makes the product and what the site is */
const JSON_LD = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    legalName: LEGAL.name,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
    description: "An enterprise AI gateway: every request from employees and AI agents to AI models goes through one gateway inside the company network.",
    address: {
      "@type": "PostalAddress",
      streetAddress: LEGAL.street,
      addressLocality: LEGAL.city,
      addressRegion: LEGAL.region,
      postalCode: LEGAL.zip,
      addressCountry: "US",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "en-US",
  },
];

export const viewport: Viewport = {
  themeColor: "#0b1324",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${display.variable} ${text.variable} ${brand.variable}`}>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SmoothScroll />
        <OffscreenPause />
        <Nav />
        <main id="main">{children}</main>
        <Footer />
        <CookieBanner />
        <script
          type="application/ld+json"
          // the markup is built from the constants above; there is no user input in it
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  );
}
