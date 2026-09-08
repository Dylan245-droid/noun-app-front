import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { fetchApi } from '@/services/api'

export interface PageContent {
  id: number
  title: string
  slug: string
  subtitle: string
  hero_image: string | null
  page_type: string
  status: string
  meta_title: string
  meta_description: string
  keywords: string
  og_image: string | null
  noindex: boolean
  order: number
  show_in_nav: boolean
  nav_label: string
  content_json: Record<string, unknown>
  content: string
  sections: string
}

export function usePageContent(pageType: string) {
  const [data, setData] = useState<PageContent | null>(null)
  const [loading, setLoading] = useState(true)
  const { i18n } = useTranslation()

  useEffect(() => {
    fetchApi(`/pages/type/${pageType}/`)
      .then((data: any) => {
        setData({ ...data, content_json: typeof data.content_json === 'string' ? JSON.parse(data.content_json) : data.content_json })
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [pageType, i18n.language])

  return { data, loading }
}
