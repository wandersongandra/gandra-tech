# Gandra Tech — auditoria e intervenção imersiva (2026-10-09)

## Critério editorial
O site continua a apresentar serviços, projetos e contacto; a linguagem cinematográfica é uma camada de apresentação, não uma porta de entrada obrigatória. Visual preto/papel com acento periwinkle e serif editorial preservados. Evitar bibliotecas de megabytes, video de autoplay e scroll hijacking no mobile.

## Referências examinadas
- [Awwwards — categorias WebGL / 3D](https://www.awwwards.com/websites/art/): profundidade, qualidade tipográfica e transições com direção de arte.
- [Codrops — retrospectiva criativa 2025](https://tympanus.net/codrops/2025/12/29/2025-a-very-special-year-in-review/): movimento associado a narrativa, não efeito gratuito.
- [Codrops — portfólio 3D 2026](https://tympanus.net/codrops/2026/04/28/more-than-a-portfolio-building-a-scroll-driven-3d-world-with-something-to-say/): modelos compactos, restrição de draw calls e estado reduzido para mobile.
- [web.dev LCP](https://web.dev/articles/lcp): carregamento inicial e área visível devem manter prioridade.
- [web.dev INP](https://web.dev/articles/inp): evitar renderização pesada concorrendo com interação.

As referências orientaram princípios, não importação de código, cenas ou visuais.

## Auditoria por disciplina
| Disciplina | Situação observada | Decisão |
| --- | --- | --- |
| Identidade visual | Tipografia editorial consistente e paleta acento; hero forte mas muitos efeitos paralelos | Preservar identidade; introduzir uma única instalação visual 3D |
| Movimento | Hero WebGL e partículas rodam continuamente mesmo fora da viewport | IntersectionObserver, pausa por visibilidade e redução de FPS |
| Mobile | Lenis já desativado em toque, hero tem controles de potência | 3D de baixa resolução, 24 FPS e fallback CSS |
| Acessibilidade | Skip link, foco visível, menu mobile modal, várias guardas reduced-motion | Cena decorativa aria-hidden, links reais, frame estático para reduced-motion |
| SEO | Rotas e metadata por projeto, sitemap validado anteriormente | Não modificar rotas, evitar cabeçalhos extras conflitantes |
| Segurança | CSP de script baseada em SHA-256 após build, headers e scanner presentes | Manter gate de build; não introduzir CDNs nem novas dependências |
| Offline | O service worker não listava os dois cases de outubro | Versionar cache e incluir Gisley/AJN na lista segura |
| QA | CI estrutural, typecheck, export estático e audit estão presentes | Guardas adicionais de integração + CI da branch |

## Fases implementadas
1. **Direção de arte**: secção Gandra Lab entre serviços e trabalhos, tipografia editorial, malha, anotações técnicas e CTA para o portfólio.
2. **Escultura 3D**: shader GLSL com geometria real por campos de distância (três órbitas e núcleo), iluminação e reflexos, resposta ao cursor e à rolagem. WebGL nativo; zero dependências adicionadas.
3. **Governança da GPU**: máximo 960×700 pixels na nova cena, 40 FPS desktop e 24 FPS toque; viewport gating, pause quando aba oculta, alternativa estática e respeito a prefers-reduced-motion / saveData.
4. **Performance do hero**: os canvases anteriores param de processar fora do campo de visão e em aba oculta; renderização limitada.
5. **Qualidade e disponibilidade**: rota do laboratório sem alterar sitemap, revisão do service worker, regressões automatizadas.

## Limites de validação
- Passar no CI não é uma medição de FPS, INP, LCP ou memória em hardware real. Não registrar metas como alcançadas sem laboratório com navegadores e dispositivos.
- Cenário WebGL pode variar entre GPUs, drivers e sistemas operacionais; fallback não depende de shaders.
- Audit de segurança estático não substitui pentest e auditoria dos serviços de e-mail ou infraestrutura externa.
- **Política de publicação**: abrir PR e usar Cloudflare Preview; não efetuar merge/deploy do domínio principal antes de revisão visual e aprovação.
