const pako = require('pako');

function encodeOutput(outputBuffer, storageEncoding){
  if(storageEncoding === "utf-8"){
    return outputBuffer.toString("utf-8");
  }else if(storageEncoding==="hex"){
    return outputBuffer.toString("hex")
  }else if(storageEncoding==="base64"){
    return outputBuffer.toString("base64");
  }else if(storageEncoding==="binary"){
    return outputBuffer;
  }
}
function compressAndEncodeRowData(rowData, compression, storageEncoding) {
  if(storageEncoding === "utf-8"){
    if(compression === "none"){
      return typeof rowData === 'string'?rowData:rowData.toString('utf-8');
    }else{
      throw new Error("Error encoding row data: utf-8 storage encoding only allowed when compression=none!")
    }
  }

  const rowDataBuffer = typeof rowData === 'string' ? Buffer.from(rowData,'utf-8') : rowData;

  if(compression === "deflate"){
    return encodeOutput(pako.deflate(rowDataBuffer), storageEncoding)
  }else if(compression==="none"){
    return encodeOutput(rowDataBuffer);
  }else{
    throw new Error("Unsupported row result data compression algorithm '"+compression+"'!")
  }
}

module.exports = {
  compressAndEncodeRowData,
}