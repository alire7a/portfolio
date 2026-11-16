import { experience } from '../data/content'
import { SectionHeader } from './SectionHeader'

export function Experience() {
  return (
    <section id="experience" className="section experience" data-scene="experience">
      <div className="container">
        <SectionHeader
          index="04"
          label="Experience"
          title={
            <>
              Seven years, <em>fully</em> remote.
            </>
          }
        />

        <ol className="exp__list" data-stagger>
          {experience.map((job) => (
            <li key={job.company} className="exp__item">
              <div className="exp__period">{job.period}</div>
              <div className="exp__body">
                <h3 className="exp__role">
                  {job.role} <span className="exp__at">at</span> <span className="exp__company">{job.company}</span>
                </h3>
                <ul className="exp__points">
                  {job.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
