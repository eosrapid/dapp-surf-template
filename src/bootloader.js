//const finalResourceGroups = require('../.eoscdn.config.final.json');
import configFinal from './.eoscdn.config.final.js';
import {loadAllResourceGroups} from './remoteDecoder';

const {cdnDependencies} = configFinal;

async function loadAllResources() {
  await loadAllResourceGroups(cdnDependencies, {});

}

export {
  loadAllResources,
}