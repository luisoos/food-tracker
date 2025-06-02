import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '@/styles/globals.css';
import Providers from './providers';
import Navigation from '@/components/navigation';
import { useEffect } from 'react';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'Ernährungstracker',
    description: '',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang='de'>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <Providers><div className='w-11/12 lg:max-w-4xl mx-auto h-full min-h-screen'>
                <Navigation />{children}</div></Providers>
            </body>
        </html>
    );
}
