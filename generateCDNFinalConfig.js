const cdnConfig = require('./eoscdn.config.js');
const fs = require('fs');
const path = require('path');
const util = require('util');
const { generateFinalWavesCDNConfig } = require('./eos-cdn-tools/utils/generateFinalCDNConfig.js');
const { getPreprocessedDependencies, getAllExternals } = require('./eos-cdn-tools/utils/preprocessDependencies.js');

const writeFile = util.promisify(fs.writeFile);

async function getFinalConfig(){
  const allExternals = getAllExternals(cdnConfig.resourceGroups)
  const preprocessedDependencies = getPreprocessedDependencies(cdnConfig.resourceGroups);
  console.log("Preprocessed dependencies!")
  const result = await generateFinalWavesCDNConfig(preprocessedDependencies, {disableLocal: true});
  await writeFile(path.resolve(__dirname, './src/.eoscdn.config.final.js'), `module.exports = {
  cdnDependencies: ${JSON.stringify(result)},
  allExternals: ${JSON.stringify(allExternals)},
}`);
  console.log("Wrote new CDN final config to './.eoscdn.config.final.js'!");
}

getFinalConfig()
.then(()=>process.exit(0))
.catch(error=>{
  console.error("FATAL ERROR: ",error);
  process.exit(1)
})