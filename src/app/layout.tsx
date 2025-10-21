import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ChakraProviders } from '@/components/providers/ChakraProviders';
import { ReduxProvider } from '@/components/providers/ReduxProvider';
import {
  AudioProvider,
  FloatingMusicButton,
} from '@/components/music/MusicPlayer';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Wedding Invitation',
  description: "You're invited to our special day",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReduxProvider>
          <ChakraProviders>
            <AudioProvider>
              {children}
              <FloatingMusicButton />
            </AudioProvider>
          </ChakraProviders>
        </ReduxProvider>
      </body>
    </html>
  );
}
