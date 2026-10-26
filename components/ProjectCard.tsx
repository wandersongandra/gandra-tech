import Link from 'next/link'
import DrawArrow from '@/components/motion/DrawArrow'
import ImageFill from '@/components/motion/ImageFill'
import type { Project } from '@/lib/projects'

type ProjectCardProps = {
  project: Project
  index: number
  compact?: boolean
}

export default function ProjectCard({ project, index, compact = false }: ProjectCardProps) {
  return (
    <Link
      href={`/trabalhos/${project.slug}`}
      prefetch={false}
      className={`project-card${compact ? ' project-card--compact' : ''}`}
    >
      <div className="project-card__media">
        <ImageFill
          src={project.workImage}
          alt={`Imagem real do projeto ${project.name}`}
          sizes={compact ? '(min-width: 900px) 42vw, 100vw' : '(min-width: 900px) 46vw, 100vw'}
          quality={95}
          objectFit="cover"
          objectPosition="center"
          fallback={
            <div className="project-card__placeholder">
              <span>{project.name}</span>
            </div>
          }
        />
        <span className="project-card__index" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      <div className="project-card__body">
        <div className="project-card__meta">
          <span>{project.category}</span>
          <span>{project.year}</span>
        </div>
        <h3 className="project-card__title">{project.name}</h3>
        <p className="project-card__headline">{project.headline}</p>
        <span className="project-card__action">
          Ver case
          <DrawArrow size={14} delay={0.25} />
        </span>
      </div>
    </Link>
  )
}
