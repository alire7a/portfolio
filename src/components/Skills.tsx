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
          {skills.map((s) => (
            <div key={s.group} className="skills__row">
              <h3 className="skills__group">{s.group}</h3>
              <ul className="skills__items">
                {s.items.map((item) => (
                  <li key={item} className="chip">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
