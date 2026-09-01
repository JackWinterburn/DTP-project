import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ada Course Finder',
  description:
    'Find Your Path: a personalised quiz matching Year 10-11 students to Ada Manchester courses and T-Levels.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col font-sans">
        {/* Visually hidden until focused -- lets keyboard users jump past the header on every page (NFR2). */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-neutral-900 focus:px-4 focus:py-2 focus:text-white focus:outline-none dark:focus:bg-neutral-100 dark:focus:text-neutral-900"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
