import { cookies } from "next/headers";
import { Shell } from "@/components/Shell";
import "./globals.css";

export const metadata = {
  title: "HPP OpenAPI Lab",
  description: "Laboratorio visual Hik-Partner Pro OpenAPI V2.15.500",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = (await cookies()).get("hpp_theme")?.value === "light" ? "light" : "dark";

  return (
    <html lang="es" data-theme={theme}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Outfit:wght@400;500;650;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Shell theme={theme}>{children}</Shell>
      </body>
    </html>
  );
}
