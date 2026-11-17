import { aiWorkflow } from '../data/content'
import { SectionHeader } from './SectionHeader'

export function AiWorkflow() {
  return (
    <section id="ai" className="section ai" data-scene="ai">
      <div className="container">
        <SectionHeader
          index="05"
          label="AI workflow"
          title={
            <>
              AI in the loop, <em>craft</em> in the details.
            </>
          }
        />

        <div className="ai__body">
          <p className="ai__intro" data-reveal>
            {aiWorkflow.intro}
          </p>

          <div className="ai__tools" data-reveal>
            <span className="label">Daily tools</span>
            <ul className="ai__chips">
              {aiWorkflow.tools.map((tool) => (
                <li key={tool} className="chip">
                  {tool}
                </li>
              ))}
            </ul>
          </div>

          <ol className="ai__steps" data-stagger>
            {aiWorkflow.steps.map((step, i) => (
              <li key={step.title} className="ai__step">
                <span className="ai__index">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="ai__title">{step.title}</h3>
                  <p className="ai__detail">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
