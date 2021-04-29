const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const util = require('util');
const fetch = require('node-fetch');
const {getTableValueFromSourceObject} = require('./eos/rowData');
const {loadOneByOnePromiseArray} = require('./promises');

function sha256Buffer(buf){
  return crypto.createHash('sha256').update(buf).digest();
}
function sha256File(filePath){
  return new Promise((resolve, reject)=>{
    fs.readFile(filePath,(err, data)=>{
      if(err){
        reject(err);
      }else{
        resolve(sha256Buffer(data));
      }
    })
  })
}
async function sha256RemoteFile(url){
  const resp = await fetch(url);
  const buf = await resp.buffer();
  return sha256Buffer(buf);
}
async function sha256EOSResource(sourceObject) {
  const value = await getTableValueFromSourceObject(sourceObject);
  return sha256Buffer(value);
}
const pathToProjectRoot = path.resolve(__dirname, '../../');
const pathToNodeModules = path.resolve(pathToProjectRoot, './node_modules');
const buildPrefixToNodeModules = '../node_modules/';
const buildPrefixToProjectRoot = '../';

async function getResourceFileInfoNpm(source){
  const relativePathInNodeModules = path.join(source.package, source.pathInPackage);

  const absolutePath = path.resolve(pathToNodeModules, relativePathInNodeModules);
  const hash = await sha256File(absolutePath);
  const pathFromBuild = path.join(buildPrefixToNodeModules, relativePathInNodeModules);

  return {
    type: 'local-file',
    sha256Hex: hash.toString('hex'),
    sha256Base64: hash.toString('base64'),
    absolutePath: absolutePath,
    pathFromBuild: pathFromBuild,
  };
}
async function getResourceFileInfoProject(source){
  const absolutePath = path.resolve(pathToProjectRoot, source.pathInProject);
  const hash = await sha256File(absolutePath);
  const pathFromBuild = path.join(buildPrefixToProjectRoot, pathInProject);

  return {
    type: 'local-file',
    sha256Hex: hash.toString('hex'),
    sha256Base64: hash.toString('base64'),
    absolutePath: absolutePath,
    pathFromBuild: pathFromBuild,
  };
}
async function getResourceFileInfoHTTPS(source){
  const hash = await sha256RemoteFile(source.fullSource);

  return {
    type: "remote-file",
    sha256Hex: hash.toString('hex'),
    sha256Base64: hash.toString('base64'),
    url: source.fullSource,
  };
}
async function getResourceFileInfoHTTP(source){
  const hash = await sha256RemoteFile(source.fullSource);

  return {
    type: "remote-file",
    sha256Hex: hash.toString('hex'),
    sha256Base64: hash.toString('base64'),
    url: source.fullSource,
  };
}
async function getResourceFileInfoEOS(source){
  const hash = await sha256EOSResource(source);

  return {
    ...source,
    type: "eos-file",
    sha256Hex: hash.toString('hex'),
    sha256Base64: hash.toString('base64'),
  };
}
const sourceProcessors = {
  npm: getResourceFileInfoNpm,
  project: getResourceFileInfoProject,
  http: getResourceFileInfoHTTP,
  https: getResourceFileInfoHTTPS,
  eos: getResourceFileInfoEOS,
}

async function getResourceFileInfo(source){
  if(sourceProcessors.hasOwnProperty(source.pathType)&&typeof sourceProcessors[source.pathType]==='function'){
    const result = await sourceProcessors[source.pathType](source);
    return result;
  }else{
    throw new Error("Invalid source pathType "+source.pathType+" in sources!");
  }
}
async function processFullResource(resource, options){
  const gOptions = options || {};

  const newResource = Object.assign({}, resource)
  if(resource.type === "script" || resource.type === "css"){
    if(!Array.isArray(newResource.sources)||!newResource.sources.length){
      throw new Error("Resource of type "+resource.type+" has no sources!");
    }
    
    newResource.sources = await Promise.all(resource.sources.map(s=>getResourceFileInfo(s)));
    const referenceSha256Hex = newResource.sources[0].sha256Hex;
    const referenceFullSource = resource.sources[0].fullSource;
    if(typeof referenceSha256Hex!=='string' || referenceSha256Hex.length !== 64){
      throw new Error("Error computing sha256 hash for the data in "+referenceFullSource+"!");
    }
    for(let sInd=0;sInd<newResource.sources.length;sInd++){
      if(newResource.sources[sInd].sha256Hex!==referenceSha256Hex){
        throw new Error(
          "Error processing resource, sha256 hash mismatch between '" +
            resource.sources[0].fullSource +
            "' (" +
            referenceSha256Hex +
            ") and '" +
            resource.sources[sInd].fullSource +
            "' (" +
            newResource.sources[sInd].sha256Hex +
            ")!"
        );
      }
    }
    newResource.sha256Hex = newResource.sources[0].sha256Hex;
    newResource.sha256Base64 = newResource.sources[0].sha256Hex;
    newResource.sources = newResource.sources.map(s=>{
      const newSource = Object.assign({}, s);
      delete newSource.sha256Hex;
      delete newSource.sha256Base64;
      return newSource;
    });
    if(gOptions.disableLocal){
      newResource.sources = newResource.sources.filter(s=>s.type !== "local-file");
    }
    return newResource;
  }else{
    return newResource;
  }

}
async function processPreprocessedResourceGroup(preProcessedResourceGroup, options){
  const gOptions = options || {};
  const newResourceGroup = await loadOneByOnePromiseArray(
    preProcessedResourceGroup.map(
      rg => (()=>Promise.all(rg.map(fr=>processFullResource(fr, gOptions))))
    )
  );
  return newResourceGroup;
}

module.exports = {
  getResourceFileInfo,
  processFullResource,
  processPreprocessedResourceGroup,
}