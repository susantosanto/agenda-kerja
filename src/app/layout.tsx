import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "AGENDA KERJA OPS GUGUS KH. ZAENAL MUSTOFA",
  description: "Aplikasi Todo List Kolaboratif untuk komunitas",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background`}>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  )
}