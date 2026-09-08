import { Metadata } from 'next'
import { getSeoMetadata } from '@/lib/seo'
import HomePageClient from '@/components/home/HomePageClient'

import { API_BASE_URL } from '@/services/api'

async function fetchHomeData() {
  const [pageRes, projectsRes, partnersRes] = await Promise.all([
    fetch(`${API_BASE_URL}/pages/type/home/`, { cache: 'no-store' }).catch(() => null),
    fetch(`${API_BASE_URL}/portfolio/projects/published/`, { cache: 'no-store' }).catch(() => null),
    fetch(`${API_BASE_URL}/portfolio/clients/partners/`, { cache: 'no-store' }).catch(() => null),
  ]);

  const data = pageRes && pageRes.ok ? await pageRes.json() : null;
  const projectsData = projectsRes && projectsRes.ok ? await projectsRes.json() : { results: [] };
  const partnersData = partnersRes && partnersRes.ok ? await partnersRes.json() : { results: [] };

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
