import { useEffect, useState } from 'react'

/**
 * Campaign goal progress - shared by the donation app and the staff
 * dashboard so a styling/accessibility fix only needs to happen once.
 * Fills from 0 on mount so real progress reads as motion, not a static bar.
 */
export default function ProgressBar({ percent }) {
  const clamped = Math.min(Math.max(percent, 0), 100)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setWidth(clamped))
    return () => cancelAnimationFrame(frame)
  }, [clamped])

  return (
    <div
      className="h-2 rounded-full bg-line overflow-hidden"
      role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}
    >
      <div className="h-full bg-teal transition-[width] duration-700 ease-out" style={{ width: `${width}%` }} />
    </div>
  )
}
