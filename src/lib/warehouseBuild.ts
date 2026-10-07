import warehouseBuild from '@/data/warehouse-build.generated.json';

// Generated before bundling, then used by both prerendering and browser reads.
// Vite dev has live detail loaders, so it does not need a publication cutoff.
export const warehouseBuildMaxId = __DEV_SERVER__ ? undefined : warehouseBuild.maxId;
