import Skeleton, { SkeletonGroup } from '@/components/ui/Skeleton';

export default function SpotDetailSkeleton() {
  return (
    <SkeletonGroup label="Loading spot" className="space-y-5">
      <Skeleton className="aspect-[3/2] w-full rounded-sm" />
      <div className="flex gap-2">
        <Skeleton shape="line" className="h-7 w-24" />
        <Skeleton shape="line" className="h-7 w-14" />
      </div>
      <div className="space-y-2.5">
        <Skeleton shape="line" className="w-3/4" />
        <Skeleton shape="line" className="w-1/2" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Skeleton shape="line" className="h-11" />
        <Skeleton shape="line" className="h-11" />
        <Skeleton shape="line" className="h-11" />
      </div>
      <div className="space-y-2.5">
        <Skeleton shape="line" className="w-full" />
        <Skeleton shape="line" className="w-full" />
        <Skeleton shape="line" className="w-2/3" />
      </div>
    </SkeletonGroup>
  );
}
