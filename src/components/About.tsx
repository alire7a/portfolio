import { about } from '../data/content'
import { Portrait } from './Portrait'
import { SectionHeader } from './SectionHeader'

export function About() {
  const words = about.statement.split(' ')
  return (
    <section id="about" className="section about" data-scene="about">
      <div className="container">
        <SectionHeader index="01" label="About" />

        <div className="about__layout">
          <div className="about__main">
            <p className="about__statement" data-scrub-words>
              {words.map((w, i) => (
                <span key={i} className="word">
                  {w}{' '}
                </span>
              ))}
            </p>

            <div className="about__grid">
              <dl className="about__stats" data-stagger>
                {about.stats.map((s) => (
                  <div key={s.label} className="stat">
                    <dt className="stat__value" data-count={s.value} data-suffix={s.suffix}>
                      {s.value}
                      {s.suffix}
                    </dt>
                    <dd className="stat__label">{s.label}</dd>
                  </div>
                ))}
              </dl>

              <dl className="about__facts" data-stagger>
                {about.facts.map((f) => (
                  <div key={f.label} className="fact">
                    <dt className="label">{f.label}</dt>
                    <dd>{f.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <aside className="about__aside">
            <Portrait />
          </aside>
        </div>
      </div>
    </section>
  )
}
