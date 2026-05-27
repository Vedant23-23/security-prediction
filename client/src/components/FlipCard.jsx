export default function FlipCard({ icon, frontTitle, frontText, backTitle, backPoints, backContent, highlight }) {
  return (
    <div className="flip-card">
      <div className="flip-card-inner">
        {/* Front */}
        <div className="flip-card-front">
          <div className="flip-card-icon">{icon}</div>
          <h3>{frontTitle}</h3>
          <p>{frontText}</p>
          <div className="flip-card-hint">Hover to learn more →</div>
        </div>

        {/* Back */}
        <div className="flip-card-back">
          <h3>{backTitle}</h3>
          {highlight && (
            <div className="accuracy-badge">✅ {highlight} Accuracy</div>
          )}
          {backContent && <p>{backContent}</p>}
          {backPoints && (
            <ul>
              {backPoints.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
