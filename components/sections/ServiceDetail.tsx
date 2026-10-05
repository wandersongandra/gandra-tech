import Link from 'next/link'
import { getProject } from '@/lib/projects'
import { getService, type Service } from '@/lib/services'
import { contactMailto } from '@/lib/site'

export default function ServiceDetail({ service }: { service: Service }) {
  const relatedProject = service.relatedProjectSlug
    ? getProject(service.relatedProjectSlug)
    : undefined

  const relatedServices = service.relatedServiceSlugs
    .map((slug) => getService(slug))
    .filter((item): item is Service => Boolean(item))

  return (
    <section className="service-detail">
      <div className="container">
        <header className="service-detail__hero">
          <p className="service-detail__eyebrow">SERVIÇO / GANDRA TECH</p>
          <h1>{service.headline}</h1>
          <p className="service-detail__lead">{service.lead}</p>
          <a href={contactMailto} className="link-arrow service-detail__primary-cta">
            Solicitar orçamento ↗
          </a>
        </header>

        <div className="service-detail__intro-grid">
          <div>
            <p className="service-detail__label">O SERVIÇO</p>
            <p className="service-detail__copy">{service.description}</p>
          </div>
          <div>
            <p className="service-detail__label">PARA QUEM FAZ SENTIDO</p>
            <p className="service-detail__copy">{service.idealFor}</p>
          </div>
        </div>

        <section className="service-detail__section" aria-labelledby="problemas-title">
          <p className="service-detail__label">CENÁRIOS COMUNS</p>
          <h2 id="problemas-title">Problemas que este tipo de projeto pode resolver.</h2>
          <ul className="service-detail__plain-list">
            {service.painPoints.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="service-detail__section" aria-labelledby="processo-title">
          <p className="service-detail__label">COMO ESTRUTURAMOS</p>
          <h2 id="processo-title">Do contexto à implementação.</h2>
          <ol className="service-detail__steps">
            {service.process.map((step, index) => (
              <li key={step.title}>
                <span className="service-detail__step-number">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="service-detail__section" aria-labelledby="entregas-title">
          <p className="service-detail__label">ESCOPO POSSÍVEL</p>
          <h2 id="entregas-title">O que pode entrar no projeto.</h2>
          <ul className="service-detail__deliverables">
            {service.deliverables.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          {relatedProject && (
            <Link
              href={`/trabalhos/${relatedProject.slug}`}
              prefetch={false}
              className="service-detail__case-link"
            >
              Ver projeto relacionado: {relatedProject.name} ↗
            </Link>
          )}
        </section>

        <section className="service-detail__section" aria-labelledby="faq-title">
          <p className="service-detail__label">PERGUNTAS FREQUENTES</p>
          <h2 id="faq-title">Dúvidas antes de começar.</h2>
          <div className="service-detail__faq">
            {service.faq.map((item) => (
              <article key={item.question}>
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="service-detail__related" aria-labelledby="relacionados-title">
          <p className="service-detail__label">SERVIÇOS RELACIONADOS</p>
          <h2 id="relacionados-title">Outras frentes que podem fazer parte do mesmo projeto.</h2>
          <div className="service-detail__related-links">
            {relatedServices.map((item) => (
              <Link key={item.slug} href={`/servicos/${item.slug}`} prefetch={false}>
                {item.title} ↗
              </Link>
            ))}
            <Link href="/servicos" prefetch={false}>
              Ver todos os serviços ↗
            </Link>
          </div>
        </section>

        <section className="service-detail__contact">
          <p className="service-detail__label">NOVO PROJETO</p>
          <h2>Tem um contexto parecido com esse?</h2>
          <p>
            Conte o que precisa ser resolvido. O primeiro passo é entender o cenário antes de
            definir escopo, prazo e tecnologia.
          </p>
          <a href={contactMailto} className="link-arrow service-detail__primary-cta">
            Falar sobre o projeto ↗
          </a>
        </section>
      </div>
    </section>
  )
}
