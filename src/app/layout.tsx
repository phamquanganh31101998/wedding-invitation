import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ChakraProviders } from '@/components/providers/ChakraProviders';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { TenantProvider } from '@/components/providers/TenantProvider';
import { AudioProvider } from '@/features/music';
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
  description:
    'Bạn được mời tham dự ngày đặc biệt của chúng tôi. Xem những khoảnh khắc đáng nhớ và gửi phản hồi tham dự.',
  keywords: 'thiệp cưới, wedding invitation, photo gallery, RSVP, kết hôn',
  openGraph: {
    title: 'Thiệp Cưới',
    description:
      'Bạn được mời tham dự ngày đặc biệt của chúng tôi. Xem những khoảnh khắc đáng nhớ và gửi phản hồi tham dự.',
    type: 'website',
  },
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
        <QueryProvider>
          <ChakraProviders>
            <TenantProvider>
              <AudioProvider>{children}</AudioProvider>
            </TenantProvider>
          </ChakraProviders>
        </QueryProvider>
      </body>
    </html>
  );
}
