import type { Metadata } from 'next';
import './globals.css';
import AuthProvider from "@/context/AuthContext";

export const metadata: Metadata = {
  title: 'FitPro — Fitness Coaching Platform',
  description: 'Connect with your coach, track your progress, crush your goals',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}