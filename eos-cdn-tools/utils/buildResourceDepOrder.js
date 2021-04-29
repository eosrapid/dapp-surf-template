function getAllDependencies(startGroup, rgMap, currentList, currentGroup) {
  if(currentGroup===null){
    currentGroup = startGroup;
  }else if(currentGroup === startGroup){
    throw new Error("Error: Circular dependency, "+startGroup+" depends on it self!");
  }else{
    if(currentList.indexOf(currentGroup)!==-1){
      return currentList;
    }
  }
  if(currentGroup !== startGroup){
    currentList.push(currentGroup);
  }
  (rgMap[currentGroup].dependsOn||[]).forEach(d=>getAllDependencies(startGroup, rgMap, currentList, d));
  return currentList;
}
function ensureNoBadDependencies(resourceGroups, groupNames){
  for(let i=0;i<resourceGroups.length;i++){
    const badDependencies = resourceGroups[i].dependsOn.filter(d=>d===resourceGroups[i].name || groupNames.indexOf(d)===-1);
    if(badDependencies.length!==0){
      throw new Error("Error building dependency loading order ("+resourceGroups[i].name+"): Missing dependencies "+badDependencies.join(",")+"!");
    }
  }

}

function buildResourceDependencyOrder(resourceGroups){
  const groupNames = resourceGroups.map(rg=>rg.name);
  ensureNoBadDependencies(resourceGroups, groupNames);
  const rgMap = {};
  resourceGroups.forEach(rg=>{
    if(rgMap.hasOwnProperty(rg.name)){
      throw new Error("Error building dependency loading order, duplicate resource group name "+rg.name);
    }
    rgMap[rg.name] = rg;
  });
  const rgDependencyMap = {};
  resourceGroups.forEach(rg=>rgDependencyMap[rg.name] = getAllDependencies(rg.name, rgMap, [], null));
  let notReadyGroups = groupNames.concat([]);
  let readyGroups = [];
  const waveList = [];
  const MAX_ITERATIONS = groupNames.length*groupNames.length;
  let currentIteration = 0;
  while(notReadyGroups.length !== 0){
    currentIteration++;
    if(currentIteration>=MAX_ITERATIONS){
      throw new Error("Error building resource dependency load order, exceeded maximum number of iterations!");
    }
    const newNotReadyGroups = [];
    const newWaveGroups = [];
    for(let nrgName of notReadyGroups){
      if(rgDependencyMap[nrgName].length === 0){
        newWaveGroups.push(nrgName);
      }else{
        newNotReadyGroups.push(nrgName);
      }
    }
    notReadyGroups = newNotReadyGroups;
    readyGroups = readyGroups.concat(newWaveGroups);
    waveList.push(newWaveGroups);
    for(let nrgName of notReadyGroups){
      rgDependencyMap[nrgName] = rgDependencyMap[nrgName].filter(gn=>notReadyGroups.indexOf(gn)!==-1);
    }
  }
  return waveList;
}
function buildLoaderListForGroup(resourceGroup){
  if(resourceGroup.loadOrder==="strict"){
    return resourceGroup.resources.map(r=>[r]);
  }else{
    return [resourceGroup.resources.concat([])];
  }
}
function buildResourceDependencyArray(resourceGroups){
  const rgMap = {};
  resourceGroups.forEach(rg=>{
    if(rgMap.hasOwnProperty(rg.name)){
      throw new Error("Error building dependency loading order, duplicate resource group name "+rg.name);
    }
    rgMap[rg.name] = rg;
  });
  const dependencyWaves = buildResourceDependencyOrder(resourceGroups);
  const finalWaves = dependencyWaves.map(dw=>dw.map(rgn=>buildLoaderListForGroup(rgMap[rgn])));
  return finalWaves;
}

module.exports = {
  buildResourceDependencyOrder,
  buildResourceDependencyArray,
}