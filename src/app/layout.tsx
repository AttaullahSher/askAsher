import type { Metadata, Viewport } from 'next';
import { Archivo, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ExperienceProvider } from '@/lib/experience';
import { asset } from '@/lib/paths';
import { site } from '@/content/site';

// Self-hosted at build time by next/font — no runtime request to Google.
const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-archivo',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-mono-face',
  display: 'swap',
});

const title = `${site.name} — ${site.tagline}`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: title,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    'ASHER',
    'creative developer',
    'automation',
    'AI',
    'interactive',
    'developer portfolio alternative',
  ],
  authors: [{ name: site.name }],
  manifest: asset('site.webmanifest'),
  icons: {
    icon: [
      { url: asset('icons/favicon-32.png'), sizes: '32x32', type: 'image/png' },
      { url: asset('icons/icon-192.png'), sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: asset('icons/apple-touch-icon.png'), sizes: '180x180' }],
  },
  openGraph: {
    type: 'website',
    siteName: site.name,
    title,
    description: site.description,
    url: site.url,
    images: [
      {
        url: asset('og.png'),
        width: 1200,
        height: 630,
        alt: `${site.name} — ${site.tagline}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description: site.description,
    images: [asset('og.png')],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#04060a',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  // Lets the page paint behind the notch; safe-area insets do the rest.
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={site.locale} className={`${archivo.variable} ${mono.variable}`}>
      <head>
        {/* With JS off the page is still readable: reveals resolve, gate goes. */}
        <noscript>
          <style>{`
            [data-noscript-hide]{display:none!important}
            .reveal,.reveal-wipe{opacity:1!important;transform:none!important;clip-path:none!important}
            [data-hero-rest]{opacity:1!important;transform:none!important}
          `}</style>
        </noscript>
      </head>
      <body>
        <ExperienceProvider>{children}</ExperienceProvider>
      </body>
    </html>
  );
}
