import { ResumeCardSkeleton } from "@/components/resume-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {Array.from({ length: 6 }, (_, index) => (
          <ResumeCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}