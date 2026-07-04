/**
 * Decorative ocean-wave divider - purely atmospheric (aria-hidden), used to
 * break up flat sections without resorting to a plain <hr>. `color` takes
 * any Tailwind text-color class so it can sit on paper or ink backgrounds.
 */
export default function WaveDivider({ className = '', color = 'text-teal/10' }) {
  return (
    <svg
      viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true"
      className={`w-full h-10 ${color} ${className}`}
    >
      <path
        fill="currentColor"
        d="M0,32 C180,60 360,4 540,24 C720,44 900,58 1080,36 C1260,14 1350,10 1440,20 L1440,60 L0,60 Z"
      />
    </svg>
  )
}
