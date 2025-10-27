import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ChakraProviders } from '@/components/providers/ChakraProviders';
import { ReduxProvider } from '@/components/providers/ReduxProvider';
import { AudioProvider } from '@/components/music/MusicPlayer';
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
  title: 'Thiệp Cưới',
  description: "Bạn được mời tham dự ngày đặc biệt của chúng tôi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReduxProvider>
          <ChakraProviders>
            <AudioProvider>{children}</AudioProvider>
          </ChakraProviders>
        </ReduxProvider>
      </body>
    </html>
  );
}
