/**
 * Letters roll up one after another on hover of the closest link/button.
 * Each letter carries a copy of itself (text-shadow) one line below — pure CSS, no JS per frame.
 */
export function RollText({ text }: { text: string }) {
  return (
    <span className="roll">
      <span className="sr-only">{text}</span>
      {[...text].map((c, i) => (
        <span key={i} className="roll__char" aria-hidden style={{ '--i': i } as React.CSSProperties}>
          {c === ' ' ? ' ' : c}
        </span>
      ))}
    </span>
  )
}
