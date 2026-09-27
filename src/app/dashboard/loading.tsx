import { ResumeCardSkeleton } from "@/components/resume-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>
      <div className="grid sm:grid-cols-3 gap-5">
        {Array.from({ length: 6 }, (_, index) => (
          <ResumeCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}