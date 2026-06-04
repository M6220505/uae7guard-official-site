import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'UAE7Guard | Enterprise-grade Web3 Security Platform',
  description:
    'Production-ready Web3 security platform with real-time blockchain transaction risk analysis.',
  icons: {
    icon: '/logo.jpg',
    shortcut: '/logo.jpg'
  }
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({children}: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
