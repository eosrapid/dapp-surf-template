const {processPreprocessedResourceGroup} = require('./processCDNResourceGroup');

async function generateFinalWavesCDNConfig(preprocessedWaves, options){
  const finalWaves = [];
  for(let i=0;i<preprocessedWaves.length;i++){
    finalWaves[i] = await Promise.all(preprocessedWaves[i].map(pprg=>processPreprocessedResourceGroup(pprg, options)));
  }
  return finalWaves;
}

module.exports = {
  generateFinalWavesCDNConfig,
}