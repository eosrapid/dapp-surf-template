const {buildResourceDependencyArray} = require('./buildResourceDepOrder');
const {parseResourceSourcePath} = require('./parseResourceSource');

function getPreprocessedDependencies(resourceGroups){
  const resourceWaves = buildResourceDependencyArray(resourceGroups);
  const newResourceWaves = resourceWaves.map(resourceWave=>{
    return resourceWave.map(resourceGroup=>{
      return resourceGroup.map(resourceBatch=>{
        return resourceBatch.map(resource=>{
          const newResource = Object.assign({}, resource);
          delete newResource.externals;
          if(Array.isArray(newResource.sources)){
            newResource.sources = newResource.sources.map(src=>parseResourceSourcePath(src));
          }
          return newResource;
        })
      })
    })
  });
  return newResourceWaves;
}

function getAllExternals(resourceGroups){
  const allExternals = {};
  resourceGroups.forEach(rg=>{
    if(Array.isArray(rg.resources)){
      rg.resources.forEach(r=>{
        if(r.externals && typeof r.externals === 'object'){
          Object.assign(allExternals, {}, r.externals);
        }
      })
    }
  });
  return allExternals;
}

module.exports = {
  getPreprocessedDependencies,
  getAllExternals,


}