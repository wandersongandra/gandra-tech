import Link from 'next/link'
import Picture from '@/components/materia/Picture'
import { previewImage, type Project } from '@/lib/projects'

type ProjectCardProps = {
  project: Project
  index: number
  compact?: boolean
  total?: number
}

export default function ProjectCard({ project, index, compact = false, total }: ProjectCardProps) {
  const number = String(index + 1).padStart(2, '0')
  const Heading = compact ? 'h2' : 'h3'
  return (
    <Link
      href={`/trabalhos/${project.slug}`}
      data-curtain={project.name}
      prefetch={false}
      className={`project-card${compact ? ' project-card--compact' : ''}`}
      data-cursor="Ver case"
    >
      <div className="project-card__frame">
        <div className="project-card__media">
          <div className="project-card__media-inner">
            <Picture
              src={previewImage(project)}
              alt={project.siteImage ? `Página inicial do site de ${project.name} no ar` : `Imagem real do projeto ${project.name}`}
              sizes={compact ? '(min-width: 900px) 50vw, 118vw' : '(min-width: 1024px) 46vw, 118vw'}
              className="m-fill"
            />
          </div>
        </div>
        <span className="project-card__index mono" aria-hidden="true">
          {number}
          {total ? <span className="project-card__total">/{String(total).padStart(2, '0')}</span> : null}
        </span>
      </div>

      <div className="project-card__body">
        <div className="project-card__meta mono">
          <span>{project.category}</span>
          <span>{project.year}</span>
        </div>
        {/* No arquivo o card vem logo após o h1 da página: h2 mantém a ordem. */}
        <Heading className="project-card__title">{project.name}</Heading>
        <p className="project-card__headline">{project.headline}</p>
        <span className="project-card__action mono">
          Ver case <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  )
}
