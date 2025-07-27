// 'use client';

// import { ThemeProvider as NextThemesProvider } from "next-themes";
// import { type ThemeProviderProps } from "next-themes/dist/types";

// export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
//     return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
// }

// components/ui/theme-provider.tsx
'use client';

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps as NextThemeProps } from "next-themes";

interface ThemeProviderProps extends NextThemeProps {
    children: React.ReactNode;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
