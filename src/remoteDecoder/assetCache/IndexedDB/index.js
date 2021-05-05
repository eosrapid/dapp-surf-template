import {
  openAssetCacheDB,
  addAssetToAssetCacheDB,
  getAssetFromAssetCacheDB,
  
  getAssetAcessedAt,
  setAssetAccessedAt,
  removeAssetFromAssetCacheDB,
  removeAllAssetsFromAssetCacheDB,
} from './dbHelpers';
const STORAGE_ENGINE = 'IndexedDB';
function supportsIndexedDB() {
  if(window.indexedDB){
    return true;
  }else{
    return false;
  }
}
class IndexedDBAssetCache {
  static storageEngine = STORAGE_ENGINE;
  static isSupported(){
    return supportsIndexedDB();
  }
  constructor(){
    this.db = null;
  }
  getStorageEngine() {
    return STORAGE_ENGINE;
  }
  async open(){
    if(!this.db){
      this.db = await openAssetCacheDB();
      return true;
    }else{
      return false;
    }
  }
  async addAsset(hash, data) {
    if(!this.db){
      throw new Error("Database not opened!");
    }
    const lowercaseHash = hash.toLowerCase();
    const result = await addAssetToAssetCacheDB(this.db, lowercaseHash, data);
    return result;
  }

  async getAssetData(hash){
    if(!this.db){
      throw new Error("Database not opened!");
    }
    const lowercaseHash = hash.toLowerCase();
    try {
      const result = await getAssetFromAssetCacheDB(this.db, lowercaseHash);
      if(!result || typeof result !=='object' || result.hash !== lowercaseHash || typeof result.data === 'undefined' || result.data === null){
        throw new Error("Invalid asset response for asset with hash "+lowercaseHash+" fetched from cache!")
      }
      const data = result.data;
      if(typeof data !== 'string'){
        throw new Error("Asset data must be a string!");
      }
      try {
        await setAssetAccessedAt(this.db, hash, Date.now());
      }catch(errAccessedAt){
        console.error("Error setting accessed at: ",errAccessedAt);
      }
      return data;
    }catch(err){
      console.error("Error getting asset data: ",err);
      return null;
    }
  }
  async removeAssetFromDB(hash){
    if(!this.db){
      throw new Error("Database not opened!");
    }
    const result = await removeAssetFromAssetCacheDB(this.db, hash);
    return result;
  }
  async removeAll() {
    if(!this.db){
      throw new Error("Database not opened!");
    }
    const result = await removeAllAssetsFromAssetCacheDB(this.db);
    return result;
  }
  async close() {
    if(this.db){
      const oldDb = this.db;
      this.db = null;
      try {
        oldDb.close();
        return true;
      }catch(err){
        return false;
      }
    }else{
      this.db = null;
      return false;
    }
  }
}

export {
  IndexedDBAssetCache,
}