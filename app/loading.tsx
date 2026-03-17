export default function Loading() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-64 animate-pulse rounded-[28px] border border-white/10 bg-white/5"
        />
      ))}
    </div>
  );
}
