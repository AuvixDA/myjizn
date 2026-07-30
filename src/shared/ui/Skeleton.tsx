interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`rounded-lg bg-white/[0.06] bg-shimmer animate-shimmer ${className}`} />;
}

export function PageSkeleton() {
  return (
    <div className="flex flex-col gap-4 max-w-2xl animate-pulse">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}
