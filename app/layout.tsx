import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { ServiceWorkerRegister } from '@/components/pwa/ServiceWorkerRegister';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  applicationName: 'QuickSet',
  title: 'QuickSet - Field Service Management',
  description:
    'Dispatch jobs, track technicians and invoice customers from one place.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'QuickSet',
    statusBarStyle: 'default',
  },
};

export const viewport: Viewport = {
  themeColor: '#1467c2',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.variable, 'font-sans')}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ServiceWorkerRegister />
          {children}
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
