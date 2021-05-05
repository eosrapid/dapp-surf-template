import {decompressAndDecodeRowResultData} from './decoder';
import {tryAllPromises} from './promise';
import * as eosjsLight from 'eosjs-light';
import sha256 from 'js-sha256';
import { getAPIManagerBySlugForce } from './network/currentNetwork';
import { supportsAssetCache, getAssetCacheManager } from './assetCache';


function eosSourceObjectToTableQuery(sourceObject){
  const tableQuery = {
    json: true,
    code: sourceObject.contractName,
    scope: sourceObject.scope,
    table: sourceObject.tableName,
    lower_bound: sourceObject.keyValue,
    limit: 1,
    reverse: false,
    show_payer: false,
  };
  if(typeof sourceObject.indexPosition!=='undefined'&&sourceObject!==null){
    tableQuery.index_position = sourceObject.indexPosition;
  }
  if(typeof sourceObject.keyType === 'string'){
    tableQuery.key_type = sourceObject.keyType;
  }
  return tableQuery;

}
function getEOSAPIURLForNetworkName(networkName){
  if(networkName==="mainnet"){
    return "https://api.eosrapid.com";
  }else if(networkName==="jungle"){
    return "https://jungle3.cryptolions.io";
  }else{
    throw new Error("Unsupported network "+networkName+"!");
  }
}
async function getRawAssetFromChain(resource, sourceObject){
  const apiManager = getAPIManagerBySlugForce(sourceObject.network);
  const tableQuery = eosSourceObjectToTableQuery(sourceObject);
  const result = await apiManager.get_table_rows(tableQuery);
  if(!result||typeof result!=='object'||!Array.isArray(result.rows)||result.rows.length === 0){
    throw new Error("Invalid row response for source "+sourceObject.fullSource+"!");
  }
  const rowResult = result.rows[0];
  if(typeof rowResult !== 'object' || !rowResult || !rowResult.hasOwnProperty(sourceObject.dataKey)){
    throw new Error("Invalid row response for source "+sourceObject.fullSource+"!");
  }
  
  const dataString = rowResult[sourceObject.dataKey];
  if(sourceObject.keyType === "sha256"){
    const dataStringSha256Hash = sha256(dataString);
    if(typeof sourceObject.keyValue!=='string'||sourceObject.keyValue.toLowerCase()!==dataStringSha256Hash.toLowerCase()){
      throw new Error("Invalid row response!");
    }
  }
  return dataString;
}
async function getAssetDataFromChain(resource, sourceObject) {
  const dataString = await getRawAssetFromChain(resource, sourceObject);
  const decodedString = decompressAndDecodeRowResultData(
    dataString,
    sourceObject.storageEncoding,
    sourceObject.compression,
    sourceObject.outputEncoding
  );
  window._sha256 = sha256;
  console.log("sha256 result: ",sha256(decodedString));
  const decodedSha256Hash = sha256(decodedString).toLowerCase()
  if(decodedSha256Hash !== resource.sha256Hex.toLowerCase()){
    throw new Error("Invalid resource hash in decoded output of getAssetDataFromChain, expected "+resource.sha256Hex+", got "+decodedSha256Hash);
  }

  const canUseAssetCache = supportsAssetCache();
  if(canUseAssetCache && typeof decodedSha256Hash === 'string'){
    const assetCacheManager = getAssetCacheManager();
    try{
      await assetCacheManager.open();
      await assetCacheManager.addAsset(decodedSha256Hash, decodedString);
    }catch(err){
      console.error("Error adding asset to asset cache: ",err);
    }
  }


  return 
}
function loadCSSRemote(src, integrity){
  return new Promise(function(resolve, reject) {
    const s = document.createElement('link');
    let r = false;
    s.type = 'text/css';
    s.rel = 'stylesheet';
    s.async = true;
    if(typeof integrity==='string'){
      s.integrity = integrity;
    }

    s.onerror = function(err) {
      reject(err, s);
    };
    s.onload = s.onreadystatechange = function() {
      // console.log(this.readyState); // uncomment this line to see which ready states are called.
      if (!r && (!this.readyState || this.readyState === 'complete')) {
        r = true;
        resolve();
      }
    };
    s.href = src;
    document.head.appendChild(s);
  });
}
function loadScriptRemote(src, integrity) {
  return new Promise(function(resolve, reject) {
    const s = document.createElement('script');
    let r = false;
    s.type = 'text/javascript';
    s.async = true;
    s.crossOrigin = "anonymous";
    if(typeof integrity==='string'){
      s.integrity = integrity;
    }
    
    s.onerror = function(err) {
      reject(err, s);
    };
    s.onload = s.onreadystatechange = function() {
      // console.log(this.readyState); // uncomment this line to see which ready states are called.
      if (!r && (!this.readyState || this.readyState === 'complete')) {
        r = true;
        resolve();
      }
    };
    s.src = src;
    const t = document.getElementsByTagName('script')[0];
    t.parentElement.insertBefore(s, t);
  });
}

function addScriptFromText(scriptText) {
  (new Function(scriptText))();
}
function addCSSFromText(cssText){
  const styleSheet = document.createElement("style")
  styleSheet.innerText = cssText
  document.head.appendChild(styleSheet)
}
async function loadEOSSource(resource, sourceObject) {
  const value = await getAssetDataFromChain(resource, sourceObject);
  
  if(resource.type==="css"){
    addCSSFromText(value);
  }else if(resource.type==="script"){
    addScriptFromText(value);
  }else{
    throw new Error("Unsupported resource type for EOS Loader: "+resource.type+"!");
  }
}
async function loadRemoteFile(resource, sourceObject){
  if(resource.type==="css"){
    await loadCSSRemote(sourceObject.url, "sha256-"+resource.sha256Base64);
  }else if(resource.type==="script"){
    await loadScriptRemote(sourceObject.url, "sha256-"+resource.sha256Base64);
  }else{
    throw new Error("Unsupported resource type for Remote Loader: "+resource.type+"!");
  }
}
async function loadLocalFile(resource, sourceObject){
  if(resource.type==="css"){
    await loadCSSRemote(sourceObject.pathFromBuild);
  }else if(resource.type==="script"){
    await loadScriptRemote(sourceObject.pathFromBuild);
  }else{
    throw new Error("Unsupported resource type for Local Loader: "+resource.type+"!");
  }
}
async function loadResourceFromAssetCache(resource){
  const canUseAssetCache = supportsAssetCache();
  if(resource.type!=="inject" && typeof resource.sha256Hex === 'string' && canUseAssetCache){
    const assetCacheManager = getAssetCacheManager();
    await assetCacheManager.open();
    console.log('resource.sha256Hex: ',resource.sha256Hex)
    const value = await assetCacheManager.getAssetData(resource.sha256Hex);
    if(typeof value === 'string'){
      if(resource.type==="css"){
        return addCSSFromText(value);
      }else if(resource.type==="script"){
        return addScriptFromText(value);
      }else{
        throw new Error("Unsupported resource type for asset cache Loader: "+resource.type+"!");
      }
    }else{
      throw new Error("Invalid response from asset cache for asset with hash "+resource.sha256Hex);
    }
  }
  throw new Error("Asset cache not supported or not supported for this resource!");
}
async function loadResourceFromSource(resource, sourceObject) {
  if(sourceObject.type==="eos-file"){
    await loadEOSSource(resource, sourceObject);
  }else if(sourceObject.type==="remote-file"){
    await loadRemoteFile(resource, sourceObject)
  }else if(sourceObject.type==="local-file"){
    await loadLocalFile(resource, sourceObject)
  }else{
    throw new Error("Unsupported source type "+sourceObject.type);
  }
}
async function injectSource(resource) {
  if(resource.injectType==="inline-css"){
    addCSSFromText(resource.content);
  }else if(resource.injectType==="inline-script"){
    addScriptFromText(resource.content);
  }else{
    throw new Error("Unsupported inject type for inject source loader: "+resource.injectType+"!");
  }
  
}
async function loadResource(resource, options){
  console.log(resource);
  if(resource.type==="inject"){
    await injectSource(resource);
  }else{
    const canUseAssetCache = supportsAssetCache();
    if(canUseAssetCache){
      try {
        await loadResourceFromAssetCache(resource);
        return;
      }catch(err){}
    }
    await tryAllPromises(resource.sources.map((s)=>()=>loadResourceFromSource(resource, s)));
  }
}

export {
  loadResource,
}