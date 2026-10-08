import type { Metadata, Viewport } from "next";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import SmoothScroll from "@/components/SmoothScroll";
import CookieBanner from "@/components/CookieBanner";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import { CONTACTS } from "@/lib/site";
import { brand, display, text } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Кордон AI — корпоративный ИИ-шлюз в вашем контуре",
    template: "%s · Кордон AI",
  },
  description:
    "Все запросы сотрудников и ИИ-агентов к нейросетям — через один шлюз в вашем контуре: персданные маскируются, доступы и расходы на модели под контролем.",
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: SITE_NAME,
    images: [{ url: "/og/home.png", width: 1200, height: 630, alt: "Кордон AI — защита, которая окупает себя" }],
  },
  twitter: { card: "summary_large_image", images: ["/og/home.png"] },
};

/* разметка Schema.org: кто делает продукт и что за сайт */
const JSON_LD = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.svg`,
    description: "Корпоративный ИИ-шлюз: все запросы сотрудников и ИИ-агентов к нейросетям — через один шлюз в контуре компании.",
    parentOrganization: { "@type": "Organization", name: "ООО «Вебпрактик»", url: "https://webpractik.ru" },
    sameAs: ["https://webpractik.ai", "https://t.me/Webpractik_Ai"],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Москва",
      streetAddress: "ул. Шаболовка, д. 34, стр. 3",
      addressCountry: "RU",
    },
    contactPoint: {
      "@type": "ContactPoint",
      email: CONTACTS.email,
      telephone: CONTACTS.tel,
      contactType: "sales",
      availableLanguage: ["Russian"],
      areaServed: "RU",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "ru-RU",
  },
];

export const viewport: Viewport = {
  themeColor: "#0b1324",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={`${display.variable} ${text.variable} ${brand.variable}`}>
      <body>
        <a className="skip-link" href="#main">
          Перейти к содержанию
        </a>
        <SmoothScroll />
        <Nav />
        <main id="main">{children}</main>
        <Footer />
        <CookieBanner />
        <script
          type="application/ld+json"
          // разметка собирается из констант выше, пользовательского ввода в ней нет
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  );
}
