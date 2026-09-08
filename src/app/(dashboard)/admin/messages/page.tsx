'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mail, Clock, Trash2 } from 'lucide-react'
import { fetchApi } from '@/services/api'

interface Message {
  id: number
  name: string
  email: string
  phone: string
  subject: string
  message: string
  created_at: string
  is_read: boolean
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [selected, setSelected] = useState<Message | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const data = await fetchApi('/contact/messages/')
      setMessages(data.results || data)
    } catch {
      // Fallback
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = async (msg: Message) => {
    setSelected(msg)
    try {
      const data = await fetchApi(`/contact/messages/${msg.id}/`)
      setSelected(data)
    } catch {
      // Fallback: keep the list data
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce message ?')) return
    try {
      await fetchApi(`/contact/messages/${id}/`, { method: 'DELETE' })
      setMessages((prev) => prev.filter((m) => m.id !== id))
      if (selected?.id === id) setSelected(null)
    } catch {
      console.error('Failed to delete')
    }
  }

  if (loading) return <p className="text-muted">Chargement...</p>

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-secondary tracking-tight">Messages</h1>
        <p className="text-muted text-sm mt-1">{messages.length} message{messages.length > 1 ? 's' : ''} reçu{messages.length > 1 ? 's' : ''}</p>
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-100">
          <Mail className="w-12 h-12 text-muted/30 mx-auto mb-4" />
          <p className="text-muted">Aucun message pour le moment</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* List */}
          <div className="lg:col-span-1 space-y-2">
            {messages.map((msg, i) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selected?.id === msg.id
                    ? 'bg-primary/5 border-primary/20'
                    : 'bg-white border-gray-100 hover:border-gray-200'
                }`}
                onClick={() => handleSelect(msg)}
              >
                <div className="flex items-start justify-between mb-1">
                  <p className="text-sm font-medium text-secondary truncate">{msg.name}</p>
                  <span className="text-[10px] text-muted whitespace-nowrap ml-2">
                    {new Date(msg.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <p className="text-xs text-muted truncate">{msg.subject}</p>
              </motion.div>
            ))}
          </div>

          {/* Detail */}
          <div className="lg:col-span-2">
            {selected ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg border border-gray-100 p-6"
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-secondary">{selected.subject}</h2>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted">
                      <span>{selected.name}</span>
                      <span>·</span>
                      <a href={`mailto:${selected.email}`} className="text-primary hover:underline">
                        {selected.email}
                      </a>
                      {selected.phone && (
                        <>
                          <span>·</span>
                          <span>{selected.phone}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted">
                      <Clock className="w-3 h-3" />
                      {new Date(selected.created_at).toLocaleString('fr-FR')}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(selected.id)}
                    className="text-muted hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="border-t pt-6">
                  <p className="text-muted leading-relaxed whitespace-pre-line">{selected.message}</p>
                </div>
              </motion.div>
            ) : (
              <div className="text-center py-16 bg-white rounded-lg border border-gray-100">
                <Mail className="w-12 h-12 text-muted/30 mx-auto mb-4" />
                <p className="text-muted">Sélectionnez un message pour le lire</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
