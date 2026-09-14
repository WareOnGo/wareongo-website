import type { useWarehouseGallery } from '@/hooks/useWarehouseGallery';
import WarehousePhoto from '@/components/WarehousePhoto';

/** Mount only the neighbour being dragged into view, keeping idle cards light. */
export default function WarehouseGalleryPreview({ gallery, delta }: {
  gallery: ReturnType<typeof useWarehouseGallery>;
  delta: 1 | -1 | null;
}) {
  if (!delta || gallery.valid.length < 2) return null;
  const index = gallery.valid[(gallery.position + delta + gallery.valid.length) % gallery.valid.length];
  const frame = gallery.frames[index];
  return <WarehousePhoto
    key={`${gallery.state.key}:${index}`}
    primary={frame.primary} initialSrc={gallery.source(index)} fallback={frame.fallback}
    alt="" aria-hidden="true" draggable={false} showLoadingIndicator={false}
    className="warehouse-gallery-photo absolute inset-0 w-full h-full object-cover pointer-events-none"
    style={{ transform: `translate3d(calc(${delta === 1 ? '100%' : '-100%'} + var(--gallery-drag-x, 0px)), 0, 0)` }}
    decoding="async"
    onLoaded={url => gallery.loaded(index, url)}
    onFailed={() => gallery.failed(index)}
  />;
}
