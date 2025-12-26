import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'DocuAPI Intelligence - AI Document Processing & API Execution',
  description: 'Process large documents, extract credentials and execute APIs automatically using Claude AI',
  keywords: 'document processing, API automation, Claude AI, web scraping, PDF processing',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          {children}
        </div>
      </body>
    </html>
  )
}
