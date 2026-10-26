import Link from 'next/link'
import ProjectCard from '@/components/ProjectCard'
import { projects } from '@/lib/projects'

export default function WorkList() {
  return (
    <section id="trabalhos" className="work-list">
      <div className="container">
        <div className="section-label">
          <span>TRABALHOS SELECIONADOS</span>
          <span className="work-list__aside">
            <span className="work-list__count">({String(projects.length).padStart(2, '0')})</span>
            <Link href="/trabalhos" prefetch={false} className="work-list__archive">
              ver arquivo completo ↗
            </Link>
          </span>
        </div>

        <div className="work-list__heading">
          <h2 className="work-list__title">Projetos com direção e código.</h2>
          <p className="work-list__intro">
            Cada case reúne contexto, decisões de projeto e registros reais do trabalho desenvolvido.
          </p>
        </div>

        <div className="project-grid project-grid--home">
          {projects.map((project, index) => (
            <ProjectCard key={project.slug} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
