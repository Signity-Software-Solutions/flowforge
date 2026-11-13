import { DEMO_MODE } from "@/lib/demo/config";
import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/shared/SessionProvider";


export const metadata: Metadata = {
  title: "FlowForge Live",
  description: "The AI automation platform that builds itself",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {DEMO_MODE ? children : <SessionProvider>{children}</SessionProvider>}
      </body>
    </html>
  );
}
