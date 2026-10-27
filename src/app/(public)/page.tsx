import { Metadata } from 'next'
import { getSeoMetadata } from '@/lib/seo'
import HomePageClient from '@/components/home/HomePageClient'

import { fetchApi } from '@/services/api'

async function fetchHomeData() {
  const [data, projectsData, partnersData] = await Promise.all([
    fetchApi('/pages/type/home/', { cache: 'no-store' }).catch(() => null),
    fetchApi('/portfolio/projects/published/', { cache: 'no-store' }).catch(() => ({ results: [] })),
    fetchApi('/portfolio/clients/partners/', { cache: 'no-store' }).catch(() => ({ results: [] })),
  ]);

  const projects = projectsData.results || projectsData || [];
  const partners = partnersData.results || partnersData || [];

  return {
    initialData: data ? { ...data, content_json: typeof data.content_json === 'string' ? JSON.parse(data.content_json) : data.content_json } : null,
    projects: projects.slice(0, 8),
    partners,
    liveStats: { projects: projects.length, partners: partners.length }
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata('home', 'NOUN CONCEPT — Architecture & Digital', "Design d'espace, aménagement paysager & urbain. Développement logiciel et solutions digitales sur mesure.")
}

export default async function Page() {
  const { initialData, projects, partners, liveStats } = await fetchHomeData();

  return (
    <HomePageClient 
      initialData={initialData}
      projects={projects}
      partners={partners}
      liveStats={liveStats}
    />
  )
}
