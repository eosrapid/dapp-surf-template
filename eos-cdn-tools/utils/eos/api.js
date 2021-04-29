const {EOS_NETWORKS} = require('../../config');

function getNetworkDefByName(networkName) {
  if(EOS_NETWORKS.hasOwnProperty(networkName) && EOS_NETWORKS[networkName].apiUrl) {
    return EOS_NETWORKS[networkName];
  }else{
    throw new Error("The "+networkName+" blockchain network is not currently supported!");
  }

}

module.exports = {
  getNetworkDefByName,
}