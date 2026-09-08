import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchApi } from '@/services/api'
import ProjectDetailClient from './ProjectDetailClient'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const project = await fetchApi(`/portfolio/projects/${resolvedParams.slug}/`, { next: { revalidate: 60 } })
    
    if (!project) return { title: 'Projet | Noun Concept' }

    return {
      title: `${project.title} — NOUN CONCEPT`,
      description: project.short_description,
      keywords: `${project.category}, ${project.location || ''}, ${project.technologies || ''}, projet ${project.category}`,
      openGraph: {
        title: project.title,
        description: project.short_description,
        images: project.images?.find((i: any) => i.is_cover)?.image || project.cover_image || project.images?.[0]?.image || undefined,
      },
      alternates: {
        canonical: `https://nounconcept.com/portfolio/${project.slug}`,
      }
    }
  } catch (error) {
    return { title: 'Projet | Noun Concept' }
  }
}

import JsonLd from '@/components/seo/JsonLd'

export default async function ProjectDetailPage({ params }: Props) {
  let project = null

  try {
    const resolvedParams = await params;
    project = await fetchApi(`/portfolio/projects/${resolvedParams.slug}/`, { next: { revalidate: 60 } })
  } catch (error: any) {
    console.error('Failed to fetch project detail:', error)
    if (error?.message?.includes('No Project matches') || error?.status === 404) {
      notFound()
    }
  }

  if (!project) {
    notFound()
  }

  const projectSchema = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.short_description || project.description,
    image: project.images?.find((i: any) => i.is_cover)?.image || project.thumbnail,
    creator: {
      '@type': 'Organization',
      name: 'NOUN CONCEPT'
    },
    datePublished: project.completion_date || project.created_at,
    url: `https://nounconcept.com/portfolio/${project.slug}`
  }

  return (
    <>
      <JsonLd data={projectSchema} />
      <ProjectDetailClient 
        initialProject={project} 
      />
    </>
  )
}
