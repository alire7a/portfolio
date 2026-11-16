import { useRef } from 'react'
import { awards } from '../data/content'
import { useTilt } from '../lib/pointer'
import { SectionHeader } from './SectionHeader'

function AwardCard({ year, title, detail }: (typeof awards)[number]) {
  const ref = useRef<HTMLLIElement>(null)
  useTilt(ref)
  return (
    <li ref={ref} className="award">
      <span className="award__glare" aria-hidden />
      <span className="award__year">{year}</span>
      <h3 className="award__title">{title}</h3>
      <p className="award__detail">{detail}</p>
    </li>
  )
}

export function Awards() {
  return (
    <section id="awards" className="section awards" data-scene="awards">
      <div className="container">
        <SectionHeader
          index="05"
          label="Recognition"
          title={
            <>
              Work that <em>earned</em> a nod.
            </>
          }
        />
        <ul className="awards__grid" data-stagger>
          {awards.map((a) => (
            <AwardCard key={a.title} {...a} />
          ))}
        </ul>
      </div>
    </section>
  )
}
