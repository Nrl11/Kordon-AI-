import type { Metadata, Viewport } from "next";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import SmoothScroll from "@/components/SmoothScroll";
import { brand, display, text } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Кордон AI — ИИ-шлюз внутри вашего контура",
    template: "%s · Кордон AI",
  },
  description:
    "Все запросы сотрудников, сервисов и ИИ-агентов к нейросетям — через один шлюз в вашем контуре: персданные маскируются, расходы видны, счёт за модели падает.",
  applicationName: "Кордон AI",
  openGraph: {
    title: "Кордон AI — защита, которая окупает себя",
    description: "Корпоративный ИИ-шлюз в вашем контуре: персданные не выходят наружу, счёт за модели падает.",
    locale: "ru_RU",
    type: "website",
  },
};

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
      </body>
    </html>
  );
}
