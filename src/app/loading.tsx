export default function GlobalLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-3">
        <div className="h-8 w-64 rounded-lg bg-gray-800" />
        <div className="h-4 w-96 max-w-full rounded bg-gray-800" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="h-28 rounded-xl border border-gray-800 bg-gray-900"
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-72 rounded-xl border border-gray-800 bg-gray-900" />
        <div className="h-72 rounded-xl border border-gray-800 bg-gray-900" />
      </div>

      <div className="h-72 rounded-xl border border-gray-800 bg-gray-900" />
    </div>
  );
}
