import './globals.css'

export default function RootLayout({ children }: { children: JSX.Element }) {
  return (
    <html lang='en'>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
