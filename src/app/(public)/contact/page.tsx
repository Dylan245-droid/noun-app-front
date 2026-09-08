import { Metadata } from 'next'
import { fetchApi } from '@/services/api'
import ContactClient from './ContactClient'

import { getSeoMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata('contact', 'Contact | Noun Concept', 'Contactez-nous.')
}

export default async function ContactPage() {
  let pageData = null
  let settings = null

  try {
    const [pageRes, settingsRes] = await Promise.all([
      fetchApi('/pages/type/contact/', { next: { revalidate: 60 } }).catch(() => null),
      fetchApi('/settings/', { next: { revalidate: 60 } }).catch(() => null)
    ])

    if (pageRes) {
      pageData = {
        ...pageRes,
        content_json: typeof pageRes.content_json === 'string' 
          ? JSON.parse(pageRes.content_json) 
          : pageRes.content_json
      }
    }
    if (settingsRes) settings = settingsRes
  } catch (error) {
    console.error('Failed to fetch contact data:', error)
  }

  return (
    <ContactClient 
      initialData={pageData} 
      initialSettings={settings} 
    />
  )
}
