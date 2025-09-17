import Navbar from '@/components/nav.js';

import './globals.css';
import { Inter } from 'next/font/google';
import { AuthContextProvider } from './context/AuthContext';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Homestead FBLA',
  description: 'The #1 FBLA Chapter in the Nation',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
