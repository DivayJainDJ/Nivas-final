export default function LoadingSurface({ label = 'Loading' }) {
  return (
    <div className="mx-auto max-w-[1680px] px-3 pb-24 pt-4 md:px-8">
      <div className="premium-card rounded-[30px] p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="h-3 w-28 animate-pulse rounded-full bg-product-mist" />
            <div className="h-8 w-[260px] animate-pulse rounded-2xl bg-product-cloud" />
            <div className="h-4 w-[360px] animate-pulse rounded-full bg-product-mist" />
          </div>
          <div className="hidden h-10 w-28 animate-pulse rounded-2xl bg-product-cloud md:block" />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-[26px] border border-product-line bg-white/70 p-4 shadow-soft">
              <div className="h-4 w-32 animate-pulse rounded-full bg-product-mist" />
              <div className="mt-4 h-8 w-20 animate-pulse rounded-2xl bg-product-cloud" />
              <div className="mt-4 h-3 w-full animate-pulse rounded-full bg-product-mist" />
              <div className="mt-2 h-3 w-5/6 animate-pulse rounded-full bg-product-mist" />
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-xs font-bold uppercase tracking-[0.22em] text-product-muted">{label}</p>
      </div>
    </div>
  )
}
