import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "POC SYSCOM — Video y Acceso",
  description: "POC de Video y Control de Acceso sobre Hik-Connect for Teams OpenAPI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Suspense fallback={null}>
          <Nav />
        </Suspense>
        <main className="shell">{children}</main>
      </body>
    </html>
  );
}
