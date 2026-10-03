import Skeleton, { SkeletonGroup } from '@/components/ui/Skeleton';

export default function EventCardSkeleton() {
  return (
    <SkeletonGroup label="Loading event" className="overflow-hidden rounded-md bg-mithila-card shadow-sm">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton shape="line" className="h-4 w-1/2" />
        <Skeleton shape="line" className="w-2/5" />
        <div className="flex gap-2 pt-1">
          <Skeleton shape="line" className="h-6 w-14" />
          <Skeleton shape="line" className="h-6 w-20" />
        </div>
      </div>
    </SkeletonGroup>
  );
}
