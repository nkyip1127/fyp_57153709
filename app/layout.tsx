import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MST Reverse-Delete Visualizer',
  description: 'Interactive visualization and learning platform for Minimum Spanning Tree algorithms using the Reverse-Delete method',
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


