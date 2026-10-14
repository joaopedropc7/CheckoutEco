import { useEffect, useState } from 'react'

const START_SECONDS = 10 * 60

export default function TopBar() {
  const [left, setLeft] = useState(START_SECONDS)

  useEffect(() => {
    const id = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(id)
  }, [])

  const mm = String(Math.floor(left / 60)).padStart(2, '0')
  const ss = String(left % 60).padStart(2, '0')

  return (
    <div className="topbar">
      <span>ÚLTIMAS UNIDADES + FRETE GRÁTIS!</span>
      <span className="timer">{mm}:{ss}</span>
    </div>
  )
}
