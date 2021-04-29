const querystring = require('querystring');
const {

  isValidEOSName,
  isValidEOSKeyType,
  isValidStorageEncoding,
  isValidOutputEncoding,
  isValidCompressionAlgorithm,
  isValidEOSNetwork,
} = require('./validation');
function parseResourceSourcePathNpm(sourcePath, afterProto){
  const beforePathSlash = afterProto.indexOf("/");
  if(beforePathSlash===-1 || beforePathSlash===(afterProto.length-1)){
    throw new Error('Invalid source "'+sourcePath+'": All npm sources must specify a file!');
  }
  const packageParts = afterProto.substring(0, beforePathSlash).split("@").map(x=>x.trim()).filter(x=>x.length);
  if(packageParts.length!==2){
    throw new Error('Invalid source "'+sourcePath+'": All npm sources must specify a package and version!');
  }
  return {
    pathType: "npm",
    fullSource: sourcePath,
    package: packageParts[0],
    version: packageParts[1],
    pathInPackage: afterProto.substring(beforePathSlash+1),
  };
}
function parseResourceSourcePathProject(sourcePath, afterProto){
  return {
    pathType: "project",
    fullSource: sourcePath,
    pathInProject: afterProto,
  };
}
function parseResourceSourcePathEOS(sourcePath, afterProto){

  const queryIndex = afterProto.indexOf("?");
  if(queryIndex===-1){
    throw new Error('Invalid source "'+sourcePath+'": All eos sources must specify scope (ex: eos://<contractname>/<tablename>/<keyvalue>?scope=<scope>&dataKey=<dataKey>)!');
  }
  const pathParts = afterProto.substring(0,queryIndex).split("/");
  if(pathParts.length!==3){
    throw new Error('Invalid source "'+sourcePath+'": All eos sources must specify contract and table (ex: eos://<contractname>/<tablename>/<keyvalue>?scope=<scope>&dataKey=<dataKey>)!');
  }
  const contractName = pathParts[0];
  const tableName = pathParts[1];
  const keyValue = pathParts[2];
  if(!isValidEOSName(contractName)){
    throw new Error('Invalid source "'+sourcePath+'": "'+contractName+'" is not a valid eos contract name!');
  }
  if(!isValidEOSName(tableName)){
    throw new Error('Invalid source "'+sourcePath+'": "'+tableName+'" is not a valid eos table name!');
  }
  if(keyValue.length===0){
    throw new Error('Invalid source "'+sourcePath+'": "'+keyValue+'" is not a valid eos key value!');

  }
  /*
  if(/[^a-f|0-9]/.test(sha256HashHex)||sha256HashHex.length!==64){
    throw new Error('Invalid source "'+sourcePath+'": "'+sha256HashHex+'" is not a valid sha256 file hash (must be hex)!');

  }*/

  const queryObj = querystring.parse(afterProto.substring(queryIndex+1));
  const scope = queryObj.scope;
  const dataKey = queryObj.dataKey;
  if(typeof scope!=='string'||!scope.length){
    throw new Error('Invalid source "'+sourcePath+'": "'+scope+'" is not a valid eos table scope!');
  }
  if(!isValidEOSName(scope)){
    throw new Error('Invalid source "'+sourcePath+'": is missing an eos table scope (ex: eos://<contractname>/<tablename>/<keyvalue>?scope=<scope>&dataKey=<dataKey>)!');
  }
  if(typeof dataKey!=='string'||!dataKey.length){
    throw new Error('Invalid source "'+sourcePath+'": "'+dataKey+'" is not a valid eos table data key!');
  }


  const sourceObject = {
    pathType: "eos",
    fullSource: sourcePath,
    contractName: contractName,
    tableName: tableName,
    scope: scope,
    keyValue: keyValue,
    dataKey: dataKey, 
  };
  if(typeof queryObj.index_position==='string'||typeof queryObj.index_position==='number'){
    const parsedIndexPosition = parseInt(queryObj.index_position+"",10);
    if(isNaN(parsedIndexPosition)){
      throw new Error('Invalid source "'+sourcePath+'": "'+queryObj.index_position+'" is not a valid eos table index position!');
    }else{
      sourceObject.indexPosition = parsedIndexPosition;
    }
  }
  if(typeof queryObj.key_type==='string'){
    if(isValidEOSKeyType(queryObj.key_type)){
      sourceObject.keyType = queryObj.key_type;
    }else{
      throw new Error('Invalid source "'+sourcePath+'": "'+queryObj.key_type+'" is not a valid eos table key type!');
    }
  }
  if(typeof queryObj.storageEncoding==='string'){
    if(isValidStorageEncoding(queryObj.storageEncoding)){
      sourceObject.storageEncoding = queryObj.storageEncoding;
    }else{
      throw new Error('Invalid source "'+sourcePath+'": "'+queryObj.storageEncoding+'" is not a valid storage encoding!');
    }
  }else{
    sourceObject.storageEncoding = "utf-8";
  }
  if(typeof queryObj.outputEncoding==='string'){
    if(isValidStorageEncoding(queryObj.outputEncoding)){
      sourceObject.outputEncoding = queryObj.outputEncoding;
    }else{
      throw new Error('Invalid source "'+sourcePath+'": "'+queryObj.outputEncoding+'" is not a valid output encoding!');
    }
  }else{
    sourceObject.outputEncoding = "utf-8";
  }
  if(typeof queryObj.compression==='string'){
    if(isValidCompressionAlgorithm(queryObj.compression)){
      sourceObject.compression = queryObj.compression;
    }else{
      throw new Error('Invalid source "'+sourcePath+'": "'+queryObj.compression+'" is not a valid compression method!');
    }
  }else{
    sourceObject.compression = "none";
  }
  if(typeof queryObj.network==='string'){
    if(isValidEOSNetwork(queryObj.network)){
      sourceObject.network = queryObj.network;
    }else{
      throw new Error('Invalid source "'+sourcePath+'": "'+queryObj.network+'" is not a valid eos network!');
    }
  }else{
    sourceObject.network = "mainnet";
  }

  return sourceObject;
}
function parseResourceSourcePathHTTPS(sourcePath, afterProto){
  return {
    pathType: "https",
    fullSource: sourcePath,
  };
}
function parseResourceSourcePathHTTP(sourcePath, afterProto){
  return {
    pathType: "http",
    fullSource: sourcePath,
  };
}
const sourceParsers = {
  npm: parseResourceSourcePathNpm,
  project: parseResourceSourcePathProject,
  http: parseResourceSourcePathHTTP,
  https: parseResourceSourcePathHTTPS,
  eos: parseResourceSourcePathEOS,
}
function parseResourceSourcePath(sourcePath){
  if(typeof sourcePath !== 'string'){
    throw new Error('Invalid source: All sources must be strings!');
  }
  const protoPartsInd = sourcePath.indexOf("://");
  if(protoPartsInd === -1){
    throw new Error('Invalid source "'+sourcePath+'": All sources must have a protocol!');
  }
  const protoType = sourcePath.substring(0, protoPartsInd);
  const afterProto = sourcePath.substring(protoPartsInd+3);
  if(sourceParsers.hasOwnProperty(protoType) && typeof sourceParsers[protoType] === 'function'){
    return sourceParsers[protoType](sourcePath, afterProto)
  }else{
    throw new Error('Invalid source "'+sourcePath+'": Unsupported protocol "'+protoType+'"!');
  }
}

module.exports = {
  parseResourceSourcePath,
}