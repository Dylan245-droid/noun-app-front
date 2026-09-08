import { Metadata } from 'next'
import { fetchApi } from '@/services/api'
import DigitalClient from './DigitalClient'

import { getSeoMetadata } from '@/lib/seo'
import JsonLd from '@/components/seo/JsonLd'

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata('digital', 'Digital | Noun Concept', 'Nos services et réalisations en digital.')
}

export default async function DigitalPage() {
  let pageData = null
  let services = []
  let projects = []

  try {
    const [pageRes, servicesRes, projectsRes] = await Promise.all([
      fetchApi('/pages/type/digital/', { next: { revalidate: 60 } }).catch(() => null),
      fetchApi('/services/?category=digital', { next: { revalidate: 60 } }).catch(() => null),
      fetchApi('/portfolio/projects/?status=published&category=digital', { next: { revalidate: 60 } }).catch(() => null)
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
    console.error('Failed to fetch digital data:', error)
  }

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Développement Web & Stratégie Digitale',
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
      name: 'Services Digitaux',
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
      <DigitalClient 
        initialData={pageData} 
        services={services} 
        projects={projects} 
      />
    </>
  )
}
