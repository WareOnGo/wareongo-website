import ListingsHeader from "./ListingsHeader";
import { Skeleton } from "@/components/ui/skeleton";
import './WarehouseCard.css';

export const WarehouseCardSkeleton = () => (
  <div data-testid="warehouse-card-skeleton" className="warehouse-card" aria-hidden="true">
    <div className="warehouse-card__photo">
      <Skeleton className="absolute inset-0 rounded-none" />
    </div>
    <div className="warehouse-card__body">
      <dl className="warehouse-card__metrics">
        {['area', 'rent'].map(metric => (
          <div key={metric} className={`warehouse-card__metric warehouse-card__${metric}`}>
            <dt><Skeleton className="h-[19px] w-20" /></dt>
            <dd><strong><Skeleton className="h-[1lh] w-24" /></strong></dd>
          </div>
        ))}
      </dl>
      <div className="warehouse-card__place"><Skeleton className="h-6 w-3/4" /></div>
      <div className="warehouse-card__specs">
        <Skeleton className="h-[22px] w-28 rounded-[3px]" />
        <Skeleton className="h-[22px] w-14 rounded-[3px]" />
        <Skeleton className="h-[22px] w-20 rounded-[3px]" />
      </div>
      <div className="warehouse-card__actions"><Skeleton className="h-11 w-full rounded-[5px]" /></div>
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
    <div className="section-container page-content">
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
      <div className="section-container page-content px-4 sm:px-6 lg:px-8">
        <div className="h-11 sm:h-5 mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between sm:justify-start sm:items-center">
          <Skeleton className="h-3 w-28 sm:w-72 max-w-full" />
          <Skeleton className="h-3 w-56 max-w-full sm:hidden" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-6 lg:mb-8">
          <div className="order-1 lg:row-span-2">
            <Skeleton data-testid="warehouse-skeleton-gallery" className="w-full h-64 sm:h-80 md:h-96 lg:h-full lg:min-h-[500px] xl:min-h-[600px] border border-wareongo-blue rounded-2xl" />
          </div>
          <div className="space-y-4 sm:space-y-6 order-2">
            <div>
              <div className="flex justify-end mb-2 h-7">
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
          <div className="order-3 lg:self-end">
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
