import {loadResource} from './coreLoaders';
import {loadOneByOnePromiseArray} from './promise';

async function loadResourceGroup(resourceGroup, options){
  const gOptions = options || {};
  await loadOneByOnePromiseArray(
    resourceGroup.map(
      rg => (()=>Promise.all(rg.map(fr=>loadResource(fr, gOptions))))
    )
  );
}


async function loadAllResourceGroups(preprocessedWaves, options){
  for(let i=0;i<preprocessedWaves.length;i++){
    await Promise.all(preprocessedWaves[i].map(pprg=>loadResourceGroup(pprg, options)));
  }
}


export {
  loadAllResourceGroups,
}