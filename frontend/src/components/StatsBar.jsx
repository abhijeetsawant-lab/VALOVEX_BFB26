import { useState, useEffect } from 'react'

const STATS = [
  { icon: '📋', value: 35, suffix: '+', label: 'Government Schemes' },
  { icon: '🗣️', value: 3, suffix: '', label: 'Languages Supported' },
  { icon: '👥', value: 10, suffix: 'Cr+', label: 'Citizens Covered' },
  { icon: '🏛️', value: 15, suffix: '+', label: 'Govt Portals Linked' },
]

function AnimatedNumber({ target, suffix }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const duration = 1800
    const step = Math.ceil(target / (duration / 30))
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(start)
    }, 30)
    return () => clearInterval(timer)
  }, [target])
  return <span>{count}{suffix}</span>
}

export default function StatsBar() {
  return (
    <div className="stats-bar">
      {STATS.map((s, i) => (
        <div key={i} className="stat-item" style={{ animationDelay: `${i * 0.1}s` }}>
          <span className="stat-icon">{s.icon}</span>
          <span className="stat-value"><AnimatedNumber target={s.value} suffix={s.suffix} /></span>
          <span className="stat-label">{s.label}</span>
        </div>
      ))}
    </div>
  )
}
