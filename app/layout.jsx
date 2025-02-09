import "./css/style.css"

import { Inter } from "next/font/google"

import { AuthProvider } from "../src/context/authContext"
import Header from "../src/components/ui/header"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-inter antialiased bg-gray-900 text-gray-200 tracking-tight`}
      >
        <AuthProvider>
          <div className="flex flex-col min-h-screen overflow-hidden">
            <Header />
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
