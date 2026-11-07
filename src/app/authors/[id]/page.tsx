import { Suspense } from 'react'
import AuthorDetail from './AuthorDetail'

// Página de detalle del autor: /authors/[id]
// El componente cliente usa useParams(), por eso va dentro de <Suspense>
export default function AuthorPage() {
  return (
    <Suspense fallback={<p className="text-slate-500">Cargando autor...</p>}>
      <AuthorDetail />
    </Suspense>
  )
}
