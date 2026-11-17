import { Fragment } from 'react'
import { skills } from '../data/content'
import { SectionHeader } from './SectionHeader'

export function Skills() {
  return (
    <section id="skills" className="section skills" data-scene="skills">
      <div className="container">
        <SectionHeader
          index="02"
          label="Capabilities"
          title={
            <>
              Product rigour, <em>motion</em> craft.
            </>
          }
        />

        <div className="skills__list" data-stagger>
          {skills.map((s, i) => (
            <div key={s.group} className="skills__group">
              <h3 className="skills__head">
                <span className="skills__num">{String(i + 1).padStart(2, '0')}</span>
                {s.group}
              </h3>
              <p className="skills__items">
                {s.items.map((item) => (
                  <Fragment key={item}>
                    <span className="skills__item">{item}</span>{' '}
                  </Fragment>
                ))}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
