const MAINNET_SUPPORTED_APIS = [
  "https://api.eosrapid.com",
  "https://mainnet.eoscannon.io",
  "https://api-mainnet.starteos.io",
  "https://eos.newdex.one",
  "https://eos.blockeden.cn",
  "https://mainnet.eosio.sg",
  "https://eos.greymass.com",
  "https://node1.zbeos.com",
  "https://api.eossweden.org",
  "https://mainnet.genereos.io",
  "https://fn001.eossv.org",
  "https://api.eosflare.io",
  "https://api.eos.cryptolions.io",
  "https://api1.eosasia.one",
  "https://api.eoseoul.io",
  "https://api.main.alohaeos.com",
  "https://api.eosn.io",
  "https://api.eosargentina.io",
  "https://eosbp.atticlab.net",
  "https://api.helloeos.com.cn",
  "https://api.eosrio.io",
  "https://api.eoslaomao.com",
  "https://eos.eoscafeblock.com"
];

const JUNGLE3_SUPPORTED_APIS = [
  "https://jungle3.eossweden.org",
  "https://jungle.eosn.io",
  "https://jungle3.cryptolions.io",
  "https://api.jungle3.alohaeos.com",
  "https://jungle.eosphere.io"
];

const MAINNET_NETWORK_DEF = {
  slug: "mainnet",
  chainId: "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906",
  supportedApis: MAINNET_SUPPORTED_APIS,
};

const JUNGLE3_NETWORK_DEF = {
  slug: "jungle",
  chainId: 'e70aaab8997e1dfce58fbfac80cbbb8fecec7b99cf982a9444273cbc64c41473',
  supportedApis: JUNGLE3_SUPPORTED_APIS,
};

const SLUG_NETWORK_MAP = {
  [MAINNET_NETWORK_DEF.slug]: MAINNET_NETWORK_DEF,
  [JUNGLE3_NETWORK_DEF.slug]: JUNGLE3_NETWORK_DEF,
};
const CHAINID_NETWORK_MAP = {
  [MAINNET_NETWORK_DEF.chainId]: MAINNET_NETWORK_DEF,
  [JUNGLE3_NETWORK_DEF.chainId]: JUNGLE3_NETWORK_DEF,
};
function getNetworkConfigBySlug(slug){
  if(SLUG_NETWORK_MAP.hasOwnProperty(slug)){
    return SLUG_NETWORK_MAP[slug];
  }else{
    return null;
  }
}
function getNetworkConfigByChainId(chainId){
  if(CHAINID_NETWORK_MAP.hasOwnProperty(chainId)){
    return CHAINID_NETWORK_MAP[chainId];
  }else{
    return null;
  }
}
function getAllNetworkDefs(){
  return Object.keys(SLUG_NETWORK_MAP).map(k=>SLUG_NETWORK_MAP[k]);
}
export {
  getNetworkConfigBySlug,
  getNetworkConfigByChainId,
  getAllNetworkDefs,
};
