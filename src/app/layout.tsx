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
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
