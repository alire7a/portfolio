type Props = { index: string; label: string; title?: React.ReactNode }

export function SectionHeader({ index, label, title }: Props) {
  return (
    <header className="section-header">
      <div className="section-header__meta" data-reveal>
        <span className="section-header__index">{index}</span>
        <span className="section-header__rule" />
        <span className="section-header__label">{label}</span>
      </div>
      {title && (
        <h2 className="section-header__title" data-split>
          {title}
        </h2>
      )}
    </header>
  )
}
