/** Warm parchment shimmer block. `shape` follows what is loading: block, line (text) or circle (avatar). */
export default function Skeleton({ shape = 'block', className = '' }) {
  const rounding = { block: 'rounded-xs', line: 'h-3 rounded-pill', circle: 'rounded-pill' }[shape];
  return <div aria-hidden="true" className={`skeleton ${rounding} ${className}`} />;
}

/** Wrap a group of skeletons so assistive tech announces one loading message. */
export function SkeletonGroup({ label = 'Loading', className = '', children }) {
  return (
    <div role="status" aria-busy="true" className={className}>
      <span className="sr-only">{label}…</span>
      {children}
    </div>
  );
}
