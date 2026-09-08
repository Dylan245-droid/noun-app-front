import { Metadata } from 'next'
import { fetchApi } from '@/services/api'
import AboutClient from './AboutClient'

import { getSeoMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata('about', 'À propos | Noun Concept', 'Découvrez notre agence Noun Concept.')
}

export default async function AboutPage() {
  let pageData = null
  let team = []

  try {
    const [pageRes, teamRes] = await Promise.all([
      fetchApi('/pages/type/about/', { next: { revalidate: 60 } }).catch(() => null),
      fetchApi('/team/', { next: { revalidate: 60 } }).catch(() => null)
    ])

    if (pageRes) {
      pageData = {
        ...pageRes,
        content_json: typeof pageRes.content_json === 'string' 
          ? JSON.parse(pageRes.content_json) 
          : pageRes.content_json
      }
    }
    if (teamRes) team = teamRes.results || teamRes
  } catch (error) {
    console.error('Failed to fetch about data:', error)
  }

  return (
    <AboutClient 
      initialData={pageData} 
      initialTeam={team} 
    />
  )
}
