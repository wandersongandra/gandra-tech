import Link from 'next/link'
import Picture from '@/components/materia/Picture'
import type { Project } from '@/lib/projects'

type ProjectCardProps = {
  project: Project
  index: number
  compact?: boolean
  total?: number
}

export default function ProjectCard({ project, index, compact = false, total }: ProjectCardProps) {
  const number = String(index + 1).padStart(2, '0')
  return (
    <Link
      href={`/trabalhos/${project.slug}`}
      prefetch={false}
      className={`project-card${compact ? ' project-card--compact' : ''}`}
      data-cursor="Ver case"
    >
      <div className="project-card__frame">
        <div className="project-card__media">
          <div className="project-card__media-inner">
            <Picture
              src={project.workImage}
              alt={`Imagem real do projeto ${project.name}`}
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
        <h3 className="project-card__title">{project.name}</h3>
        <p className="project-card__headline">{project.headline}</p>
        <span className="project-card__action mono">
          Ver case <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  )
}
