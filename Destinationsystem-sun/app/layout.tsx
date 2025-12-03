import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@components/theme-provider';
import { Toaster } from '@components/ui/toaster';
import { SettingsProvider } from '@/shared/contexts/SettingsContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Emergency Response System',
  description: 'Web interface for the 1669 Emergency Response System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <SettingsProvider>
            {children}
            <Toaster />
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}