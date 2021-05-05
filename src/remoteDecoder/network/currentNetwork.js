import {SmartEOSAPI} from './SmartEOSAPI';
import {getAllNetworkDefs} from './config';
import * as eosjsLight from 'eosjs-light';


const API_MANAGER_SLUG_MAP = {};
const API_MANAGER_CHAIN_ID_MAP = {};

function generateEOSRPCForAPIUrl(apiUrl) {
  return new eosjsLight.JsonRpc(apiUrl);
}

getAllNetworkDefs().forEach(networkDef=>{
  const apiManager = new SmartEOSAPI(generateEOSRPCForAPIUrl, networkDef.supportedApis);
  API_MANAGER_SLUG_MAP[networkDef.slug] = apiManager;
  API_MANAGER_CHAIN_ID_MAP[networkDef.chainId] = apiManager;
});

/**
 * Returns the api manager for a given slug or null if one does not exist
 * @param {string} slug
 * @returns {(SmartEOSAPI|null)}
 */
function getAPIManagerBySlug(slug){
  if(API_MANAGER_SLUG_MAP.hasOwnProperty(slug)){
    return API_MANAGER_SLUG_MAP[slug];
  }else{
    return null;
  }
}

/**
 * Returns the api manager for a given chainId or null if one does not exist
 * @param {string} chainId
 * @returns {(SmartEOSAPI|null)}
 */
function getAPIManagerByChainId(chainId){
  if(API_MANAGER_CHAIN_ID_MAP.hasOwnProperty(chainId)){
    return API_MANAGER_CHAIN_ID_MAP[chainId];
  }else{
    return null;
  }
}


/**
 * Returns the api manager for a given slug and throws an error if one does not exist
 * @param {string} slug
 * @returns {SmartEOSAPI}
 */
function getAPIManagerBySlugForce(slug){
  const apiManager = getAPIManagerBySlug(slug);
  if(apiManager){
    return apiManager;
  }else{
    throw new Error("Unsupported network slug: '"+slug+"'");
  }
}

/**
 * Returns the api manager for a given chainId and throws an error if one does not exist
 * @param {string} chainId
 * @returns {SmartEOSAPI}
 */
function getAPIManagerByChainIdForce(chainId){
  const apiManager = getAPIManagerByChainId(chainId);
  if(apiManager){
    return apiManager;
  }else{
    throw new Error("Unsupported network chainId: '"+chainId+"'");
  }
}


export {
  getAPIManagerBySlug,
  getAPIManagerBySlugForce,
  
  getAPIManagerByChainId,
  getAPIManagerByChainIdForce,
}