'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { CheckCircle, MessageSquare } from 'lucide-react'

import { physicsApi } from '@/services/physics'
import { fetchApi } from '@/services/api'
import { buildObjects, type Frame } from '@/components/physics/SceneCanvas'
import { useHeaderTheme } from '@/hooks/useHeaderTheme'
import { AnimatedSection } from '@/components/animated/AnimatedSection'

const SceneCanvas = dynamic(
  () => import('@/components/physics/SceneCanvas').then((m) => m.SceneCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    ),
  },
)

type ShareInfo = {
  ref: number
  title: string
  preset: string
  width: number
  height: number
  depth: number
  model_url: string | null
}

type SharePayload = {
  client_name: string
  note: string
  scene: { id: number; title: string; width: number; depth: number; height: number }
  simulation: { id: number; status: string; duration_seconds: number; total_frames: number } | null
  frames: Frame[]
  objects_snapshot: ShareInfo[]
}

export default function ClientSpacePage() {
  const params = useParams()
  const token = String(params?.token || '')
  const { t } = useTranslation()
  useHeaderTheme('dark')

  const [data, setData] = useState<SharePayload | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [feedbackSent, setFeedbackSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  useEffect(() => {
    const load = async () => {
      try {
        const payload = await physicsApi.getShare(token)
        const snapshot: ShareInfo[] = payload.objects_snapshot || payload.simulation?.objects_snapshot || []
        setData({ ...payload, objects_snapshot: snapshot, frames: payload.frames || [] })
      } catch (e) {
        setError(t('espace.invalid'))
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token, t])

  const submitFeedback = async (kind: 'valider' | 'modifier') => {
    setSending(true)
    try {
      const sceneTitle = data?.scene?.title || 'Aménagement'
      await fetchApi('/contact/messages/', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name || data?.client_name || 'Client',
          email: form.email,
          subject: kind === 'valider'
            ? `[Espace client] Validation — ${sceneTitle}`
            : `[Espace client] Demande de modification — ${sceneTitle}`,
          message: kind === 'valider'
            ? `Le client valide l'aménagement. ${form.message}`.trim()
            : `Demande de modification : ${form.message}`,
        }),
      })
      setFeedbackSent(true)
    } catch (e) {
      alert(t('contact.error'))
      console.error(e)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-secondary flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-[70vh] bg-secondary flex items-center justify-center px-4">
        <p className="text-white/50 text-sm">{error || t('espace.invalid')}</p>
      </div>
    )
  }

  const snapshot = data.objects_snapshot || []
  const infoByRef = new Map(snapshot.map((it) => [it.ref, it]))
  const objects = buildObjects(data.frames, infoByRef)

  return (
    <div>
      {/* En-tête */}
      <section className="bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 lg:pt-40 lg:pb-20">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-[1px] bg-white/30" />
            <span className="text-[10px] tracking-[0.3em] uppercase text-white/40">
              {t('espace.label')}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            {data.scene?.title}
          </h1>
          {data.client_name && (
            <p className="text-white/40 text-sm mt-3">{data.client_name}</p>
          )}
          {data.note && (
            <p className="text-white/60 text-sm mt-4 max-w-2xl leading-relaxed">{data.note}</p>
          )}
        </div>
      </section>

      {/* Visualisation */}
      <section className="bg-accent">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="bg-white rounded-2xl border border-secondary/10 h-[60vh] lg:h-[620px] overflow-hidden">
            {objects.length > 0 ? (
              <SceneCanvas objects={objects} footerLabel={`${objects.length} meuble(s)`} />
            ) : (
              <div className="flex items-center justify-center h-full text-muted text-sm">
                {t('espace.empty')}
              </div>
            )}
          </div>
          <p className="text-muted text-xs mt-4 max-w-2xl leading-relaxed">{t('espace.hint')}</p>
        </div>
      </section>

      {/* Votre avis */}
      <section className="bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
            <AnimatedSection>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-[1px] bg-white/30" />
                <span className="text-[10px] tracking-[0.3em] uppercase text-white/40">
                  {t('espace.label')}
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                {t('espace.feedback')}
              </h2>
              <p className="text-white/40 text-sm mt-4 max-w-md leading-relaxed">
                {t('espace.hint')}
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              {feedbackSent ? (
                <div className="flex flex-col items-start gap-4">
                  <CheckCircle className="w-10 h-10 text-white" />
                  <p className="text-white text-sm leading-relaxed">{t('espace.sent')}</p>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="grid sm:grid-cols-2 gap-8">
                    <label className="block">
                      <span className="block text-[10px] tracking-[0.2em] uppercase text-white/40 mb-3">
                        {t('espace.name')}
                      </span>
                      <input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full bg-transparent border-0 border-b border-white/20 px-0 py-2 text-white text-sm focus:outline-none focus:border-white"
                      />
                    </label>
                    <label className="block">
                      <span className="block text-[10px] tracking-[0.2em] uppercase text-white/40 mb-3">
                        {t('espace.email')} *
                      </span>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full bg-transparent border-0 border-b border-white/20 px-0 py-2 text-white text-sm focus:outline-none focus:border-white"
                      />
                    </label>
                  </div>
                  <label className="block">
                    <span className="block text-[10px] tracking-[0.2em] uppercase text-white/40 mb-3">
                      {t('espace.message')}
                    </span>
                    <textarea
                      rows={3}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full bg-transparent border-0 border-b border-white/20 px-0 py-2 text-white text-sm focus:outline-none focus:border-white resize-none"
                    />
                  </label>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => submitFeedback('valider')}
                      disabled={sending || !form.email}
                      className="inline-flex items-center gap-3 px-7 py-3.5 border border-white text-white text-sm font-medium tracking-wide hover:bg-white hover:text-secondary disabled:opacity-50 transition-colors"
                    >
                      {t('espace.validate')}
                    </button>
                    <button
                      onClick={() => submitFeedback('modifier')}
                      disabled={sending || !form.email}
                      className="inline-flex items-center gap-2 px-7 py-3.5 border border-white/20 text-white/80 text-sm font-medium tracking-wide hover:border-white hover:text-white disabled:opacity-50 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" /> {t('espace.modify')}
                    </button>
                  </div>
                </div>
              )}
            </AnimatedSection>
          </div>
        </div>
      </section>
    </div>
  )
}
