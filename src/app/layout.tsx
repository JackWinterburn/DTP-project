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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- this rule targets
            pages/_document.js; there's no such file under the App Router, and next/font/google
            is deliberately not used here (see globals.css: build-time fetches to
            fonts.googleapis.com aren't reliable in every environment this project builds in). */}
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-ada-black text-ada-white flex min-h-full flex-col font-sans">
        {/* Visually hidden until focused -- lets keyboard users jump past the header on every page (NFR2). */}
        <a
          href="#main-content"
          className="focus:bg-ada-green focus:text-ada-black sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:px-4 focus:py-2 focus:font-semibold focus:outline-none"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
