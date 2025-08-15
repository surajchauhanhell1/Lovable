import "./globals.css";
import { Inter } from "next/font/google";
import { Suspense } from "react"; // <-- add this

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Suspense fallback={null}>   {/* <-- wrap children */}
          {children}
        </Suspense>
      </body>
    </html>
  );
}
