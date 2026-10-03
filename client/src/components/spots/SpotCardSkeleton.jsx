import Skeleton, { SkeletonGroup } from '@/components/ui/Skeleton';

export default function SpotCardSkeleton() {
  return (
    <SkeletonGroup label="Loading spot" className="overflow-hidden rounded-md bg-mithila-card shadow-sm">
      <Skeleton className="aspect-[3/2] w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton shape="line" className="h-5 w-2/3" />
        <Skeleton shape="line" className="w-1/3" />
        <Skeleton shape="line" className="w-full" />
        <Skeleton shape="line" className="w-5/6" />
      </div>
    </SkeletonGroup>
  );
}
