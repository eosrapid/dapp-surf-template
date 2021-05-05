import {IndexedDBAssetCache} from './IndexedDB';

const PRIMARY_ENGINE = [IndexedDBAssetCache].filter(x=>x.isSupported())[0];
const assetCacheManager = PRIMARY_ENGINE?(new PRIMARY_ENGINE()):null;

function supportsAssetCache() {
  return !!assetCacheManager;
}
function getAssetCacheManager() {
  return assetCacheManager;
}

export {
  supportsAssetCache,
  getAssetCacheManager,
}