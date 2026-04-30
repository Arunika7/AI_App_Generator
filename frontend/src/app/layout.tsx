import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConfigProvider } from "../providers/ConfigProvider";
import { I18nProviderWrapper } from "./I18nProviderWrapper";
import { LayoutDashboard, Home } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI App Generator",
  description: "Dynamic Config-Driven Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 min-h-screen selection:bg-fuchsia-300 selection:text-fuchsia-900`}>
        <ConfigProvider>
          <I18nProviderWrapper>
            <div className="flex min-h-screen">
              {/* Vibrant Sidebar */}
              <aside className="w-72 bg-gradient-to-br from-indigo-700 via-purple-700 to-fuchsia-700 text-white p-6 shadow-2xl relative overflow-hidden flex flex-col">
                {/* Decorative blobs */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                  <div className="absolute -top-20 -left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                  <div className="absolute bottom-10 -right-10 w-40 h-40 bg-fuchsia-300 rounded-full blur-2xl"></div>
                </div>

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-10 mt-4">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md shadow-inner border border-white/30">
                      <LayoutDashboard className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
                      Platform
                    </h1>
                  </div>

                  <nav className="space-y-3">
                    <a href="/" className="flex items-center gap-3 p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 border border-transparent hover:border-white/20 shadow-sm hover:shadow-md hover:-translate-y-0.5 group">
                      <Home className="w-5 h-5 text-purple-200 group-hover:text-white transition-colors" />
                      <span className="font-medium text-purple-50 group-hover:text-white">Home</span>
                    </a>
                  </nav>
                </div>
                
                <div className="mt-auto relative z-10 bg-black/10 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-400 to-pink-500 border-2 border-white/20 flex items-center justify-center font-bold text-sm shadow-inner">
                      AG
                    </div>
                    <div>
                      <p className="text-sm font-semibold">AI Generator</p>
                      <p className="text-xs text-purple-200">Pro Edition</p>
                    </div>
                  </div>
                </div>
              </aside>
              
              <main className="flex-1 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed bg-slate-50/90 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-fuchsia-50/50 pointer-events-none" />
                <div className="relative z-10 p-10 h-full overflow-y-auto">
                  {children}
                </div>
              </main>
            </div>
          </I18nProviderWrapper>
        </ConfigProvider>
      </body>
    </html>
  );
}
