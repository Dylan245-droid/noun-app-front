import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

import "./globals.css";

import { Providers } from "@/components/providers/Providers";

export const metadata: Metadata = {
  title: {
    template: '%s | NOUN CONCEPT',
    default: 'NOUN CONCEPT - Architecture & Digital',
  },
  description: 'Studio de design pluridisciplinaire basé à Libreville. Aménagement intérieur, design urbain, art, et conception d\'applications web et mobiles.',
  openGraph: {
    title: 'NOUN CONCEPT - Architecture & Digital',
    description: 'Studio de design pluridisciplinaire basé à Libreville. Aménagement intérieur, design urbain, art, et conception d\'applications web et mobiles.',
    url: 'https://nounconcept.com',
    siteName: 'NOUN CONCEPT',
    images: [
      {
        url: 'https://nounconcept.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'NOUN CONCEPT - Architecture & Digital',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NOUN CONCEPT',
    description: 'Studio de design pluridisciplinaire basé à Libreville (Gabon).',
    images: ['https://nounconcept.com/og-image.jpg'],
  },
};

import JsonLd from "@/components/seo/JsonLd";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'NOUN CONCEPT',
    url: 'https://nounconcept.com',
    logo: 'https://nounconcept.com/logo.png',
    description: 'Studio pluridisciplinaire spécialisé dans l\'architecture d\'intérieur, le design urbain et les solutions digitales à Libreville.',
    founder: [
      {
        '@type': 'Person',
        name: 'Claude François EMANE MENGUE',
        jobTitle: 'Architecte d\'intérieur & Artiste plasticien'
      },
      {
        '@type': 'Person',
        name: 'Dylan ONDO',
        jobTitle: 'Ingénieur logiciel & Architecte système'
      }
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Libreville',
      addressCountry: 'GA',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+241XXXXXXXX',
      contactType: 'customer service',
    },
    sameAs: [
      'https://www.linkedin.com/company/noun-concept',
      'https://www.instagram.com/noun.concept'
    ]
  };

  return (
    <html lang="fr" className={`${plusJakartaSans.variable} ${inter.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${plusJakartaSans.variable} ${inter.variable} antialiased`}
      >
        <JsonLd data={organizationSchema} />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
