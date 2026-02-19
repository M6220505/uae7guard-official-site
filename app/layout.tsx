// Root layout - middleware handles all locale routing
// This exists only to satisfy Next.js requirements
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
