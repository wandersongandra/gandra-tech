import Link from 'next/link'
import { services } from '@/lib/services'
import { getProject } from '@/lib/projects'

export default function ServicesPage() {
  return (
    <section className="service-page">
      <div className="container">
        <div className="section-label">
          <span>SERVIÇOS DIGITAIS</span>
          <span>GANDRA / TECH</span>
        </div>

        <header className="service-page__header">
          <p className="service-page__eyebrow">DO ESCOPO AO PRODUTO NO AR</p>
          <h1>Desenvolvimento de sites, sistemas e aplicações web.</h1>
          <p className="service-page__intro">
            A Gandra Tecnologia cria experiências digitais para empresas, profissionais e
            empreendedores em todo o Brasil, com atendimento remoto e uma abordagem que conecta
            estratégia, design e engenharia.
          </p>
        </header>

        <div className="service-page__list">
          {services.map((service, index) => {
            const relatedProject = getProject(service.relatedProjectSlug)
            return (
              <article className="service-page__item" id={service.slug} key={service.slug}>
                <div className="service-page__number">{String(index + 1).padStart(2, '0')}</div>
                <div className="service-page__body">
                  <h2>{service.title}</h2>
                  <p className="service-page__answer">{service.description}</p>
                  <div className="service-page__details">
                    <div>
                      <h3>Para quem é</h3>
                      <p>{service.idealFor}</p>
                    </div>
                    <div>
                      <h3>O que pode entrar no projeto</h3>
                      <ul>
                        {service.deliverables.map((deliverable) => (
                          <li key={deliverable}>{deliverable}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {relatedProject && (
                    <Link href={`/trabalhos/${relatedProject.slug}`} className="service-page__case">
                      Ver projeto relacionado: {relatedProject.name} ↗
                    </Link>
                  )}
                </div>
              </article>
            )
          })}
        </div>

        <section className="service-page__process" aria-labelledby="processo-title">
          <p className="service-page__eyebrow">COMO COMEÇAMOS</p>
          <h2 id="processo-title">Cada projeto começa pelo contexto certo.</h2>
          <p>
            O primeiro passo é entender o objetivo, o público, o momento do negócio e o que precisa
            ser resolvido. A partir disso, definimos o escopo, as etapas e a melhor forma de construir
            a solução.
          </p>
          <Link href="/contato" className="link-arrow service-page__cta">
            Falar sobre um projeto ↗
          </Link>
        </section>
      </div>
    </section>
  )
}
