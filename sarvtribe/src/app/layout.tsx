// src/app/layout.tsx
import { ThemeProvider } from '@/components/ThemeProvider';
import AuthProvider from '@/components/AuthProvider';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="animated-gradient text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
        >
          <AuthProvider>
            {/* The layout components (sidebars, etc.) will be rendered inside {children} */}
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}