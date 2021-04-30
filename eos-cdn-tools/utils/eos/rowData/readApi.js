
const {decompressAndDecodeRowResultData}= require('./decode');
const {getNetworkDefByName} = require('../api');
const fetch = require('node-fetch');
const {JsonRpc} = require('eosjs');
const {createHash} = require('crypto');

function eosSourceObjectToTableQuery(sourceObject){
  const tableQuery = {
    json: true,
    code: sourceObject.contractName,
    scope: sourceObject.scope,
    table: sourceObject.tableName,
    lower_bound: sourceObject.keyValue,
    limit: 1,
    reverse: false,
    show_payer: false,
  };
  if(typeof sourceObject.indexPosition!=='undefined'&&sourceObject!==null){
    tableQuery.index_position = sourceObject.indexPosition;
  }
  if(typeof sourceObject.keyType === 'string'){
    tableQuery.key_type = sourceObject.keyType;
  }
  return tableQuery;

}
async function getTableValueFromSourceObject(sourceObject) {
  const networkDef = getNetworkDefByName(sourceObject.network || "mainnet");
  const rpc = new JsonRpc(networkDef.apiUrl, { fetch });
  const tableQuery = eosSourceObjectToTableQuery(sourceObject);

  const result = await rpc.get_table_rows(tableQuery);
  if(!result||typeof result!=='object'||!Array.isArray(result.rows)||result.rows.length === 0){
    throw new Error("Invalid row response for source "+sourceObject.fullSource+"!");
  }
  const rowResult = result.rows[0];
  if(typeof rowResult !== 'object' || !rowResult || !rowResult.hasOwnProperty(sourceObject.dataKey)){
    throw new Error("Invalid row response for source "+sourceObject.fullSource+"!");
  }
  const dataString = rowResult[sourceObject.dataKey];

  if(sourceObject.keyType === "sha256"){
    const dataStringSha256Hash = createHash('sha256').update(dataString, 'utf-8').digest().toString('hex');
    if(typeof sourceObject.keyValue!=='string'||sourceObject.keyValue.toLowerCase()!==dataStringSha256Hash.toLowerCase()){
      throw new Error("Invalid row response!");
    }
  }

  return decompressAndDecodeRowResultData(
    dataString,
    sourceObject.storageEncoding,
    sourceObject.compression,
    sourceObject.outputEncoding
  );
}
module.exports = {
  eosSourceObjectToTableQuery,
  getTableValueFromSourceObject,
}