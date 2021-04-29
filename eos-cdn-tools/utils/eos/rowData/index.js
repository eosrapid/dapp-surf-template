const {decompressAndDecodeRowResultData} = require('./decode');
const {compressAndEncodeRowData} = require('./encode');
const {getTableValueFromSourceObject, eosSourceObjectToTableQuery} = require('./readApi');
module.exports = {
  decompressAndDecodeRowResultData,
  compressAndEncodeRowData,
  getTableValueFromSourceObject,
  eosSourceObjectToTableQuery,
}