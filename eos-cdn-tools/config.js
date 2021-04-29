const mainnetConfig = {
  apiUrl: "https://api.eosrapid.com",
  chainId: "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906",
}
const jungleConfig = {
  apiUrl: 'https://jungle3.cryptolions.io',
  chainId: 'e70aaab8997e1dfce58fbfac80cbbb8fecec7b99cf982a9444273cbc64c41473',
}

const EOS_NETWORKS = {
  mainnet: mainnetConfig,
  jungle: jungleConfig,
}

module.exports = {
  EOS_NETWORKS,
}