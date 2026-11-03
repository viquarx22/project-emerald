/** Pure-CSS atmosphere shown when WebGL is unavailable, so the portfolio still feels designed. */
export function StaticBackdrop() {
  return (
    <div className="static-backdrop" aria-hidden="true">
      <svg viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice">
        <g fill="none" stroke="#00DFA0" strokeOpacity="0.35">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <path key={i} d={`M${120 + i * 40} 800 V ${420 - i * 6} a ${280 - i * 40} ${280 - i * 40} 0 0 1 ${560 - i * 80} 0 V 800`} />
          ))}
        </g>
        <g fill="none" stroke="#C8B88A" strokeOpacity="0.35">
          <path d="M80 800 V 400 a 320 320 0 0 1 640 0 V 800" />
        </g>
      </svg>
    </div>
  )
}
