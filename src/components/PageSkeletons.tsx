import ListingsHeader from "./ListingsHeader";
import { Skeleton } from "@/components/ui/skeleton";

export const WarehouseCardSkeleton = () => (
  <div data-testid="warehouse-card-skeleton" className="border border-wareongo-blue rounded-2xl overflow-hidden bg-transparent" aria-hidden="true">
    <div className="border-b border-wareongo-blue">
      <Skeleton className="w-full h-48 rounded-none" />
    </div>
    <div className="p-5 sm:p-6">
      <div className="mb-4">
        <Skeleton className="h-7 w-3/4 mb-1.5" />
        <Skeleton className="h-5 w-1/2" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-4 sm:h-5 w-4/5" />)}
      </div>
      <Skeleton className="mt-5 h-11 w-full rounded-xl" />
    </div>
  </div>
);

export const WarehouseGridSkeleton = ({ count = 9 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-hidden="true">
    {Array.from({ length: count }, (_, i) => <WarehouseCardSkeleton key={i} />)}
  </div>
);

export const ListingsSkeleton = () => (
  <main className="flex-grow bg-wareongo-ivory">
    <div className="section-container">
      <ListingsHeader loading />
      <div className="mb-12"><WarehouseGridSkeleton count={21} /></div>
    </div>
  </main>
);

export const WarehouseMapSkeleton = () => (
  <Skeleton className="w-full h-48 sm:h-56 lg:h-60 border border-wareongo-blue rounded-2xl" aria-label="Loading warehouse map" role="status" />
);

export const WarehouseDetailSkeleton = () => (
  <main className="flex-grow bg-wareongo-ivory" aria-hidden="true">
      <div className="section-container px-4 sm:px-6 lg:px-8">
        <div className="h-9 sm:h-5 mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between sm:justify-start sm:items-center">
          <Skeleton className="h-3 w-28 sm:w-72 max-w-full" />
          <Skeleton className="h-3 w-56 max-w-full sm:hidden" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-6 lg:mb-8">
          <div className="order-1 lg:row-span-2">
            <Skeleton data-testid="warehouse-skeleton-gallery" className="w-full h-64 sm:h-80 md:h-96 lg:h-[500px] xl:h-[600px] border border-wareongo-blue rounded-2xl" />
          </div>
          <div className="space-y-4 sm:space-y-6 order-2">
            <div>
              <div className="flex items-start justify-between gap-3 mb-2 h-7">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-7 w-20" />
              </div>
              <Skeleton className="h-[30px] sm:h-[38px] md:h-[45px] w-4/5 mb-3" />
              <div className="h-[23px] sm:h-[26px] flex items-center">
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="border border-wareongo-blue/30 rounded-xl p-4 sm:p-5">
                  <Skeleton className="h-[15px] sm:h-4 w-16 mb-1.5" />
                  <Skeleton className="h-7 sm:h-8 w-4/5" />
                </div>
              ))}
            </div>
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
          <div className="order-3">
            <Skeleton className="h-[15px] sm:h-4 w-20 mb-2" />
            <WarehouseMapSkeleton />
          </div>
        </div>
        <div className="border border-wareongo-blue rounded-2xl p-6 sm:p-8">
          <Skeleton className="h-4 w-36 mb-5" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border border-wareongo-blue/20 rounded-xl p-4">
                <Skeleton className="w-4 h-4 mb-2" />
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-5 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
  </main>
);
