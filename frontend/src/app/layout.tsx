import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { PWAManager } from '@/components/pwa/PWAManager'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FlowSync - Adaptive Life-Timing AI',
  description: 'Manage your energy, not just your time',
  manifest: '/manifest.json',
  themeColor: '#2E7CFF',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FlowSync',
  },
  applicationName: 'FlowSync',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <PWAManager />
          {children}
        </Providers>
      </body>
    </html>
  )
}
