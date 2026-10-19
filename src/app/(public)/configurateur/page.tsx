import { Metadata } from 'next'
import { getSeoMetadata } from '@/lib/seo'
import JsonLd from '@/components/seo/JsonLd'
import ConfigurateurClient from './ConfigurateurClient'

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata(
    'configurateur',
    'Configurateur 3D | NOUN CONCEPT',
    "Imaginez votre intérieur en 3D : choisissez une pièce, placez des meubles et testez la stabilité de votre aménagement.",
  )
}

export default function ConfigurateurPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Configurateur 3D — NOUN CONCEPT',
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Web',
    url: 'https://nounconcept.com/configurateur',
    description:
      "Configurateur d'aménagement intérieur en 3D avec simulation physique",
  }

  return (
    <>
      <JsonLd data={schema} />
      <ConfigurateurClient />
    </>
  )
}
