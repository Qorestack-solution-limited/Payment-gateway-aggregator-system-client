export function LoadingSkeleton({ className = "" }) {
  return <div className={`skeleton-shimmer rounded-xl ${className}`.trim()} />;
}
