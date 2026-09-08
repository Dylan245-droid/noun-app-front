import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { CustomCursor } from '@/components/layout/CustomCursor'
import { NoiseOverlay } from '@/components/layout/NoiseOverlay'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white custom-cursor">
      <CustomCursor />
      <NoiseOverlay />
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
