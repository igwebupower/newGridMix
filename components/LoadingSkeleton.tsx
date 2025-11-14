export function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="h-20 glass skeleton rounded-xl" />

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass p-6 rounded-xl">
            <div className="h-4 w-20 skeleton rounded mb-3" />
            <div className="h-8 w-32 skeleton rounded mb-2" />
            <div className="h-3 w-24 skeleton rounded" />
          </div>
        ))}
      </div>

      {/* Chart skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="glass p-6 rounded-xl">
            <div className="h-6 w-40 skeleton rounded mb-4" />
            <div className="h-64 skeleton rounded" />
          </div>
        ))}
      </div>

      {/* Large chart skeleton */}
      <div className="glass p-6 rounded-xl">
        <div className="h-6 w-48 skeleton rounded mb-4" />
        <div className="h-80 skeleton rounded" />
      </div>
    </div>
  );
}
