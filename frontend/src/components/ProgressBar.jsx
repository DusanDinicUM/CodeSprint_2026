/**
 * Campaign goal progress - shared by the donation app and the staff
 * dashboard so a styling/accessibility fix only needs to happen once.
 */
export default function ProgressBar({ percent }) {
  const clamped = Math.min(Math.max(percent, 0), 100)
  return (
    <div
      className="h-2 rounded-full bg-line overflow-hidden"
      role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}
    >
      <div className="h-full bg-teal" style={{ width: `${clamped}%` }} />
    </div>
  )
}
