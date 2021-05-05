import './index.css';
import {loadAllResources} from './bootloader';

import {getAPIManagerByChainId} from './remoteDecoder/network/currentNetwork';
import {getNetworkConfigByChainId} from './remoteDecoder/network/config';
import { getInjectedWebsiteConfig } from './utils/dappHelpers';


async function setupAPI() {
  try {
    const websiteConfig = getInjectedWebsiteConfig();
    if(typeof websiteConfig.chainId!=='string'){
      throw new Error("Missing chain id in injected website config!");
    }
    const apiManager = getAPIManagerByChainId(websiteConfig.chainId);
    if(!apiManager){
      return false;
    }

    const storedMetadata = websiteConfig.storedMetadata;
    const storedMetadataSize = JSON.stringify(storedMetadata).length;
    
    const urlManager = apiManager.getUrlManager();
    websiteConfig.apiUrls.forEach((au)=>{
      urlManager.reportResult(au.apiUrl, "get_table_rows", "ok", au.responseTime, storedMetadataSize+1000);
    })
  }catch(error){
  }

}

setupAPI()
.then(()=>loadAllResources())
.then(()=>{
  console.log("Loaded!");
  require('./reactApp').runApp();
})
.catch((err)=>{
  console.error("ERROR loading resources: ",err)
})