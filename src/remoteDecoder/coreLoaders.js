import {decompressAndDecodeRowResultData} from './decoder';
import {tryAllPromises} from './promise';
import * as eosjsLight from 'eosjs-light';
import sha256 from 'tiny-sha256';
import { getAPIManagerBySlugForce } from './network/currentNetwork';


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
async function getTableValueFromSourceObject(sourceObject) {
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

  return decompressAndDecodeRowResultData(
    rowResult[sourceObject.dataKey],
    sourceObject.storageEncoding,
    sourceObject.compression,
    sourceObject.outputEncoding
  );
}
function loadCSSRemote(src){
  return new Promise(function(resolve, reject) {
    const s = document.createElement('link');
    let r = false;
    s.type = 'text/css';
    s.rel = 'stylesheet';
    s.href = src;
    s.async = true;
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
    document.head.appendChild(s);
  });
}
function loadScriptRemote(src) {
  return new Promise(function(resolve, reject) {
    const s = document.createElement('script');
    let r = false;
    s.type = 'text/javascript';
    s.src = src;
    s.async = true;
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
  const value = await getTableValueFromSourceObject(sourceObject);
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
    await loadCSSRemote(sourceObject.url);
  }else if(resource.type==="script"){
    await loadScriptRemote(sourceObject.url);
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
    await tryAllPromises(resource.sources.map((s)=>()=>loadResourceFromSource(resource, s)));
  }
}

export {
  loadResource,
}