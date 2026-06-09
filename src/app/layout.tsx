import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Brewmaster',
  description:
    'A premium cafe management dashboard for processing incoming orders, managing menu categories and products, and analyzing daily sales trends.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
