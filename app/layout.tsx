import './globals.css';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/ui/theme-provider';
// import SidebarLayout from '@/components/Sidebar';
import Header from '@/components/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'QuickSet FSM',
  description: 'Field service management dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, 'bg-background text-foreground')}>
        <Header />

        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {/* <SidebarLayout> */}
          {children}
          {/* </SidebarLayout> */}

        </ThemeProvider>
      </body>
    </html>
  );
}
