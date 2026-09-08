import { Metadata } from 'next'
import { fetchApi } from '@/services/api'
import DynamicPageViewClient from './DynamicPageViewClient'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const page = await fetchApi(`/pages/${params.slug}/`, { next: { revalidate: 60 } })
    
    if (!page) return { title: 'Page | Noun Concept' }

    return {
      title: page.meta_title || page.title || 'Page | Noun Concept',
      description: page.meta_description,
      openGraph: {
        title: page.meta_title || page.title,
        description: page.meta_description,
        images: page.og_image ? [{ url: page.og_image }] : undefined,
      },
      alternates: {
        canonical: `/p/${page.slug}`,
      },
      robots: {
        index: !page.noindex,
        follow: !page.noindex,
      }
    }
  } catch (error) {
    return { title: 'Page | Noun Concept' }
  }
}

export default async function DynamicPageViewPage({ params }: Props) {
  let page = null

  try {
    page = await fetchApi(`/pages/${params.slug}/`, { next: { revalidate: 60 } })
  } catch (error) {
    console.error('Failed to fetch dynamic page:', error)
  }

  return (
    <DynamicPageViewClient 
      initialPage={page} 
    />
  )
}
