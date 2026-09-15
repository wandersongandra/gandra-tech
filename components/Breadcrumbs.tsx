import Link from 'next/link'
import { createBreadcrumbJsonLd } from '@/lib/seo'
import StructuredData from '@/components/StructuredData'

export type BreadcrumbItem = {
  name: string
  href: string
}

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <div className="breadcrumbs-wrap">
      <nav className="breadcrumbs container" aria-label="Trilha de navegação">
        <ol>
          {items.map((item, index) => {
            const isCurrent = index === items.length - 1
            return (
              <li key={item.href}>
                {isCurrent ? (
                  <span aria-current="page">{item.name}</span>
                ) : (
                  <Link href={item.href} prefetch={false}>{item.name}</Link>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
      <StructuredData data={createBreadcrumbJsonLd(items)} />
    </div>
  )
}
