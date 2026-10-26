import ProjectCard from '@/components/ProjectCard'
import { projects } from '@/lib/projects'

export default function WorkIndex() {
  return (
    <section className="windex">
      <div className="container">
        <div className="section-label">
          <span>ARQUIVO DE PROJETOS</span>
          <span className="work-list__count">({String(projects.length).padStart(2, '0')})</span>
        </div>

        <div className="windex__intro">
          <h1 className="windex__title">Portfólio de sites e sistemas desenvolvidos.</h1>
          <p className="windex__intro-copy">
            Uma seleção de projetos reais, apresentados com o contexto e as decisões que deram forma a cada entrega.
          </p>
        </div>

        <div className="project-grid project-grid--archive">
          {projects.map((project, index) => (
            <ProjectCard key={project.slug} project={project} index={index} compact />
          ))}
        </div>
      </div>
    </section>
  )
}
