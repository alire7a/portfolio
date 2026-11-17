import { projects } from '../data/content'
import { store } from '../webgl/sceneStore'
import { SectionHeader } from './SectionHeader'

export function Work() {
  const clear = () => (store.hoverTint = null)

  return (
    <section id="work" className="section work" data-scene="work">
      <div className="container">
        <SectionHeader
          index="03"
          label="Selected work"
          title={
            <>
              Sites I’ve <em>built</em> and shipped.
            </>
          }
        />

        <ol className="work__list" onMouseLeave={clear} data-stagger>
          {projects.map((p, i) => (
            <li key={p.name} className="work__item">
              <a
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="work__link"
                onMouseEnter={() => (store.hoverTint = p.tint)}
                onFocus={() => (store.hoverTint = p.tint)}
                onBlur={clear}
                style={{ '--tint': p.tint[1] } as React.CSSProperties}
              >
                <span className="work__index">{String(i + 1).padStart(2, '0')}</span>
                <span className="work__name">{p.name}</span>
                <span className="work__info">
                  <span className="work__kind">
                    {p.kind}
                    <span className="work__stack">{p.stack}</span>
                  </span>
                  {p.note && <span className="work__note">{p.note}</span>}
                </span>
                <span className="work__url">
                  {p.display}
                  <svg viewBox="0 0 24 24" aria-hidden className="work__arrow">
                    <path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                </span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
