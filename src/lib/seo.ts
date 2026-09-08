import { Metadata } from 'next'
import { publicApi } from '@/services/api'

export async function getSeoMetadata(pageName: string, defaultTitle: string, defaultDescription: string): Promise<Metadata> {
  const seoData = await publicApi.getSeo(pageName)
  
  const title = seoData?.title || defaultTitle
  const description = seoData?.meta_description || defaultDescription
  const keywords = seoData?.keywords || []

  return {
    title,
    description,
    keywords,
    openGraph: {
      title: seoData?.og_title || title,
      description: seoData?.og_description || description,
      url: `https://nounconcept.com/${pageName === 'home' ? '' : pageName}`,
      siteName: 'NOUN CONCEPT',
      images: seoData?.og_image ? [{ url: seoData.og_image, width: 1200, height: 630 }] : [{ url: 'https://nounconcept.com/og-image.jpg', width: 1200, height: 630 }],
      type: 'website',
      locale: 'fr_FR',
    },
    twitter: {
      card: 'summary_large_image',
      title: seoData?.og_title || title,
      description: seoData?.og_description || description,
      images: seoData?.og_image ? [seoData.og_image] : ['https://nounconcept.com/og-image.jpg'],
    },
    alternates: {
      canonical: seoData?.canonical_url || `https://nounconcept.com/${pageName === 'home' ? '' : pageName}`,
    },
    robots: {
      index: !seoData?.noindex,
      follow: !seoData?.noindex,
    }
  }
}
