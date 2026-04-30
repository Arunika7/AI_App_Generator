import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConfigProvider } from "../providers/ConfigProvider";
import { AuthProvider } from "../providers/AuthProvider";
import { I18nProviderWrapper } from "./I18nProviderWrapper";
import { Sidebar } from "../components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI App Generator",
  description: "Dynamic application generator platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 min-h-screen selection:bg-fuchsia-300 selection:text-fuchsia-900`}>
        <AuthProvider>
          <ConfigProvider>
            <I18nProviderWrapper>
              <div className="flex min-h-screen">
                {/* Dynamic Vibrant Sidebar */}
                <Sidebar />
                
                <main className="flex-1 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed bg-slate-50/90 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-fuchsia-50/50 pointer-events-none" />
                  <div className="relative z-10 p-10 h-full overflow-y-auto">
                    {children}
                  </div>
                </main>
              </div>
            </I18nProviderWrapper>
          </ConfigProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
