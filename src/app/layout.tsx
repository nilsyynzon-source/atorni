import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createClient } from '@/lib/supabase/server'
import { Profile } from '@/types'
import { Toaster } from 'react-hot-toast'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Atorni – Find & Book a Lawyer',
  description:
    'Connect with verified lawyers, get free legal advice, and book paid consultations online.',
  keywords: 'lawyer, attorney, legal advice, book lawyer, legal consultation',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile: Profile | null = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Toaster position="top-right" />
        <Navbar user={profile} />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
