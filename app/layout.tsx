import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'حفل زفاف خالد ورنيم',
  description: 'شاركنا فرحتنا في حفل زفافنا',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
