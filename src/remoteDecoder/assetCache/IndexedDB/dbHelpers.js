import sha256 from 'js-sha256';

const ASSET_CACHE_DB_NAME = "dapp_asset_cache"
const ASSET_CACHE_DB_VERSION = 1;
const ASSET_CACHE_DB_STORE_NAME = 'assets';
const ASSET_CACHE_DB_ACCESS_STORE_NAME = 'access';


function getIndexedDB(){
  return window.indexedDB;
}

function openAssetCacheDB() {
  return new Promise((resolve, reject)=>{
    const req = getIndexedDB().open(ASSET_CACHE_DB_NAME, ASSET_CACHE_DB_VERSION);
    req.onsuccess = function(e) {
      resolve(req.result);
    };
    req.onerror = function(e) {
      reject(req.error);
    };
    req.onupgradeneeded = function(e){
      const db = req.result;
      if (e.oldVersion < 1) {
        const assetStore = db.createObjectStore(ASSET_CACHE_DB_STORE_NAME, {keyPath: "hash"});
        const accessedStore = db.createObjectStore(ASSET_CACHE_DB_ACCESS_STORE_NAME, {keyPath: "hash"});
        accessedStore.createIndex('accessed_at', 'accessed_at', { unique: false });
        //store.createIndex('created_at', 'created_at', { unique: false });
        //store.createIndex('accessed_at', 'accessed_at', { unique: false });
      }else{
        console.log("No changes needed for version "+e.oldVersion);
      }
    }
  });
}

function addAssetToAssetCacheDBInternal(db, hash, data) {
  return new Promise((resolve, reject)=>{
    const store = db.transaction(ASSET_CACHE_DB_STORE_NAME, 'readwrite').objectStore(ASSET_CACHE_DB_STORE_NAME);
    var req;
    const assetObject = {
      hash: hash,
      data: data,
    };
    try {
      req = store.put(assetObject);
    } catch (inlineError) {
      reject(inlineError)
    }
    req.onerror = function() {
      reject(req.error);
    };
    req.onsuccess = function (event) {
      resolve(hash);
    };
  });
}
async function addAssetToAssetCacheDB(db, hash, data) {
  console.log("addAssetToAssetCacheDB[1]: ",db,hash,data);
  const realHash = sha256(data).toLowerCase();
  if(realHash!==hash.toLowerCase()){
    throw new Error("Invalid asset hash, expected "+hash+", got "+realHash);
  }
  const result = await addAssetToAssetCacheDBInternal(db, realHash, data);
  await setAssetAccessedAt(db, hash, Date.now());
  return result;
}
function removeAssetFromAssetCacheDBInternal(db, hash) {
  return new Promise((resolve, reject)=>{
    const store = db.transaction(ASSET_CACHE_DB_STORE_NAME, 'readwrite').objectStore(ASSET_CACHE_DB_STORE_NAME);
    const removeRequest = store.delete(hash)
    removeRequest.onerror = function(event) {
      reject(removeRequest.error);
    };
    removeRequest.onsuccess = function(event) {
      resolve(hash);
    };
  });
}
async function removeAssetFromAssetCacheDB(db, hash) {
  const realHash = hash.toLowerCase();
  const resultRemoveAsset = await removeAssetFromAssetCacheDBInternal(db, realHash);
  const resultRemoveAccessedAt = await removeAssetAccessedAtInternal(db, realHash);
  return resultRemoveAsset;
}

function removeAllAssetsFromAssetCacheDBInternal(db) {
  return new Promise((resolve, reject)=>{
    const store = db.transaction(ASSET_CACHE_DB_STORE_NAME, 'readwrite').objectStore(ASSET_CACHE_DB_STORE_NAME);
    const clearRequest = store.clear();
    clearRequest.onerror = function(event) {
      reject(clearRequest.error);
    };
    clearRequest.onsuccess = function(event) {
      resolve(true);
    };
  });
}

async function removeAllAssetsFromAssetCacheDB(db){
  const clearAssets = await removeAllAssetsFromAssetCacheDBInternal(db);
  const clearAccessedAt = await removeAllAssetsAccessedAtInternal(db);
  return clearAssets;
}

function getAssetFromAssetCacheDBInternal(db, hash) {
  return new Promise((resolve, reject)=>{
    const store = db.transaction(ASSET_CACHE_DB_STORE_NAME, 'readonly').objectStore(ASSET_CACHE_DB_STORE_NAME);
    const getRequest = store.get(hash)
    getRequest.onerror = function(event) {
      reject(getRequest.error);
    };
    getRequest.onsuccess = function(event) {
      console.log('getRequest.result: ',getRequest.result)
      resolve(getRequest.result);
    };
  });
}
async function getAssetFromAssetCacheDB(db, hash) {
  const realHash = hash.toLowerCase();

  const result = await getAssetFromAssetCacheDBInternal(db, realHash);
  if(!result){
    throw new Error("Data not found for asset with hash "+hash);
  }
  if(typeof result.data !== 'string') {
    throw new Error("Invalid data for asset with hash "+hash);
  }
  const resolvedHash = sha256(result.data).toLowerCase();
  if(realHash !== resolvedHash){
    throw new Error("Hash mismatch for asset cache, expected "+realHash+", got "+resolvedHash);
  }
  return result;
}

/*
function getAssetFromAssetCacheDB(db, hash){
  return new Promise((resolve, reject)=>{
    const store = db.transaction(ASSET_CACHE_DB_STORE_NAME, 'readwrite').objectStore(ASSET_CACHE_DB_STORE_NAME);
    const getRequest = store.get(hash)
    getRequest.onerror = function(event) {
      reject(getRequest.error);
    };
    getRequest.onsuccess = function(event) {
      const data = event.target.result;
      data.updated_at = Date.now();
      const requestUpdate = objectStore.put(data);
      requestUpdate.onerror = function(event) {
        reject(requestUpdate.error);
      };
      requestUpdate.onsuccess = function(event) {
        resolve(data);
      };
    };
  });
}
*/


function setAssetAccessedAt(db, hash, accessedAt) {
  return new Promise((resolve, reject)=>{
    const store = db.transaction(ASSET_CACHE_DB_ACCESS_STORE_NAME, 'readwrite').objectStore(ASSET_CACHE_DB_ACCESS_STORE_NAME);
    const accessedObject = {
      hash: hash,
      accessed_at: accessedAt,
    };
    const req = store.put(accessedObject);
    req.onsuccess = function (event) {
      resolve(hash);
    };
    req.onerror = function() {
      reject(req.error);
    };
  });
}
function removeAssetAccessedAtInternal(db, hash) {
  return new Promise((resolve, reject)=>{
    const store = db.transaction(ASSET_CACHE_DB_ACCESS_STORE_NAME, 'readwrite').objectStore(ASSET_CACHE_DB_ACCESS_STORE_NAME);
    const removeRequest = store.delete(hash)
    removeRequest.onerror = function(event) {
      reject(removeRequest.error);
    };
    removeRequest.onsuccess = function(event) {
      resolve(hash);
    };
  });
}
function removeAllAssetsAccessedAtInternal(db, hash) {
  return new Promise((resolve, reject)=>{
    const store = db.transaction(ASSET_CACHE_DB_ACCESS_STORE_NAME, 'readwrite').objectStore(ASSET_CACHE_DB_ACCESS_STORE_NAME);
    const clearRequest = store.clear()
    clearRequest.onerror = function(event) {
      reject(clearRequest.error);
    };
    clearRequest.onsuccess = function(event) {
      resolve(true);
    };
  });
}

function getAssetAcessedAt(db, hash) {
  return new Promise((resolve, reject)=>{
    const store = db.transaction(ASSET_CACHE_DB_ACCESS_STORE_NAME, 'readonly').objectStore(ASSET_CACHE_DB_ACCESS_STORE_NAME);
    
    const req = store.get(hash);
    req.onsuccess = function (event) {
      resolve(req.result);
    };
    req.onerror = function() {
      reject(req.error);
    };
  });
}


export {
  openAssetCacheDB,
  
  addAssetToAssetCacheDB,
  getAssetFromAssetCacheDB,
  removeAssetFromAssetCacheDB,
  removeAllAssetsFromAssetCacheDB,
  
  getAssetAcessedAt,
  setAssetAccessedAt,
};