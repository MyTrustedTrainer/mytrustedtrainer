import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MyTrustedTrainer — Find Trusted Fitness Trainers in College Station, TX',
  description: 'Discover and compare top personal trainers in College Station. Read verified reviews from Google, Yelp, and Facebook all in one place. Free for clients.',
  keywords: 'personal trainer College Station, fitness trainer Texas A&M, personal training Bryan TX',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}