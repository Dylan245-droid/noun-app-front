import { Metadata } from 'next'
import { fetchApi } from '@/services/api'
import ArchitectureClient from './ArchitectureClient'

import { getSeoMetadata } from '@/lib/seo'
import JsonLd from '@/components/seo/JsonLd'

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata('architecture', 'Architecture | Noun Concept', 'Nos services et réalisations en architecture.')
}

export default async function ArchitecturePage() {
  let pageData = null
  let services = []
  let projects = []

  try {
    const [pageRes, servicesRes, projectsRes] = await Promise.all([
      fetchApi('/pages/type/architecture/', { next: { revalidate: 60 } }).catch(() => null),
      fetchApi('/services/?category=architecture', { next: { revalidate: 60 } }).catch(() => null),
      fetchApi('/portfolio/projects/?status=published&category=architecture', { next: { revalidate: 60 } }).catch(() => null)
    ])

    if (pageRes) {
      pageData = {
        ...pageRes,
        content_json: typeof pageRes.content_json === 'string' 
          ? JSON.parse(pageRes.content_json) 
          : pageRes.content_json
      }
    }
    if (servicesRes) services = servicesRes.results || servicesRes
    if (projectsRes) projects = projectsRes.results || projectsRes
  } catch (error) {
    console.error('Failed to fetch architecture data:', error)
  }

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Architecture & Design d\'espace',
    provider: {
      '@type': 'Organization',
      name: 'NOUN CONCEPT'
    },
    areaServed: {
      '@type': 'Country',
      name: 'Gabon'
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Services d\'Architecture',
      itemListElement: services.map((service: any, index: number) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: service.title,
          description: service.short_description || service.description
        },
        position: index + 1
      }))
    }
  }

  return (
    <>
      <JsonLd data={serviceSchema} />
      <ArchitectureClient 
        initialData={pageData} 
        services={services} 
        projects={projects} 
      />
    </>
  )
}
