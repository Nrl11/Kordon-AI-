import type { Metadata, Viewport } from "next";
import { brand, display, text } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Кордон AI — ИИ-шлюз внутри вашего контура",
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
  themeColor: "#0a1028",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={`${display.variable} ${text.variable} ${brand.variable}`}>
      <body>{children}</body>
    </html>
  );
}
