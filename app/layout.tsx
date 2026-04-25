import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MyTrustedTrainer — Find Your Perfect Personal Trainer in College Station, TX',
  description: 'Stop guessing. MyTrustedTrainer matches you with the right personal trainer based on your goals, schedule, budget, and training style — not just star ratings.',
  keywords: 'personal trainer College Station TX, fitness trainer Texas A&M, personal training Bryan TX, trainer matching College Station',
  openGraph: {
    title: 'MyTrustedTrainer — Find Your Perfect Personal Trainer',
    description: 'Compatibility-driven trainer matching for College Station. Answer a few questions and get matched with trainers built for you.',
    url: 'https://mytrustedtrainer.com',
    siteName: 'MyTrustedTrainer',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/logo.png" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Outfit:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: 'Outfit, sans-serif' }}>{children}</body>
    </html>
  )
}
