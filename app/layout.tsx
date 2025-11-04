import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ReactNode, Suspense } from 'react';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/toaster';
import JotaiProviders from '@/components/jotai-provider';
import { ProgressBarProviders } from '@/components/progress-bar';
import { cn } from '@/lib/utils';
import { SnackbarProvider } from '@/context/SnackbarContext';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Saku Apps',
  description: 'Master Management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('min-h-screen antialiased', inter.className)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <JotaiProviders>
            <Suspense>
              <ProgressBarProviders>
                <SnackbarProvider>
                  <MainContainer>{children}</MainContainer>
                </SnackbarProvider>
              </ProgressBarProviders>
            </Suspense>
          </JotaiProviders>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}

function MainContainer({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}
