
function isValidEOSName(name){
  return typeof name === 'string' && name.length !== 0 && /(^[a-z1-5.]{0,11}[a-z1-5]$)|(^[a-z1-5.]{12}[a-j1-5]$)/.test(name);
}
function isValidEOSKeyType(keyType){
  return keyType === 'i64' ||
    keyType === 'i128' ||
    keyType === 'i256' ||
    keyType === 'float64' ||
    keyType === 'float128' ||
    keyType === 'ripemd160' ||
    keyType === 'sha256';
}
function isValidStorageEncoding(dataEncoding) {
  return dataEncoding === 'utf-8' ||
    dataEncoding === 'base64' ||
    dataEncoding === 'hex';
}
function isValidOutputEncoding(dataEncoding) {
  return dataEncoding === 'utf-8' ||
  dataEncoding === 'base64' ||
  dataEncoding === 'hex' ||
  dataEncoding === 'binary';
}
function isValidCompressionAlgorithm(dataEncoding) {
  return dataEncoding === 'none' ||
    dataEncoding === 'deflate';
}
function isValidEOSNetwork(dataEncoding) {
  return dataEncoding === 'mainnet' ||
    dataEncoding === 'jungle';
}
module.exports = {
  isValidEOSName,
  isValidEOSKeyType,
  isValidStorageEncoding,
  isValidOutputEncoding,
  isValidCompressionAlgorithm,
  isValidEOSNetwork,

}