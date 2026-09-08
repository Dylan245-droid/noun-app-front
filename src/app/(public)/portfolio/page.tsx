import { Suspense } from 'react'
import { Metadata } from 'next'
import { fetchApi } from '@/services/api'
import PortfolioClient from './PortfolioClient'

import { getSeoMetadata } from '@/lib/seo'
import JsonLd from '@/components/seo/JsonLd'

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata('portfolio', 'Portfolio | Noun Concept', 'Découvrez notre portfolio de projets.')
}

export default async function PortfolioPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  let pageData = null
  let initialProjects = []
  const filter = typeof searchParams.filter === 'string' ? searchParams.filter : 'all'

  try {
    const endpoint = filter === 'all' 
      ? '/portfolio/projects/?status=published' 
      : `/portfolio/projects/?status=published&category=${filter}`

    const [pageRes, projectsRes] = await Promise.all([
      fetchApi('/pages/type/portfolio/', { next: { revalidate: 60 } }).catch(() => null),
      fetchApi(endpoint, { next: { revalidate: 0 } }).catch(() => null)
    ])

    if (pageRes) {
      pageData = {
        ...pageRes,
        content_json: typeof pageRes.content_json === 'string' 
          ? JSON.parse(pageRes.content_json) 
          : pageRes.content_json
      }
    }
    if (projectsRes) initialProjects = projectsRes.results || projectsRes
  } catch (error) {
    console.error('Failed to fetch portfolio data:', error)
  }

  const portfolioSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Portfolio - NOUN CONCEPT',
    description: 'Découvrez nos réalisations en architecture, design d\'espace et solutions digitales.',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: initialProjects.map((project: any, index: number) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'CreativeWork',
          name: project.title,
          url: `https://nounconcept.com/portfolio/${project.slug}`,
          image: project.thumbnail,
          description: project.short_description
        }
      }))
    }
  }

  return (
    <Suspense fallback={null}>
      <JsonLd data={portfolioSchema} />
      <PortfolioClient 
        initialData={pageData} 
        initialProjects={initialProjects} 
        initialFilter={filter}
      />
    </Suspense>
  )
}
