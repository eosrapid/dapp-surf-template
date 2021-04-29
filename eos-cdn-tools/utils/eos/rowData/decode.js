const pako = require('pako');
function decodeRowResultData(data, encoding) {
  if(encoding === "utf-8"){
    return Buffer.from(data, 'utf-8');
  }else if(encoding === "hex"){
    return Buffer.from(data, 'hex');
  }else if(encoding === "base64"){
    return Buffer.from(data, 'base64');
  }else{
    throw new Error("Unsupported row result encoding '"+encoding+"'!");
  }
}
function decompressAndDecodeRowResultData(data, storageEncoding, compression, outputEncoding) {
  if(typeof data!=='string'){
    throw new Error("Data in row result is not a string!");
  }
  if(storageEncoding === "utf-8" && compression === "none" && outputEncoding === "utf-8"){
    return data;
  }
  const decodedDataBuffer = decodeRowResultData(data, storageEncoding);
  let outputBuffer;
  if(compression === "deflate"){
    if(outputEncoding === "utf-8"){
      return pako.inflate(decodedDataBuffer, {to: 'string'});
    }
    outputBuffer = pako.inflate(outputBuffer)
  }else if(compression === "none"){
    outputBuffer = decodedDataBuffer;
  }else{
    throw new Error("Unsupported row result data compression algorithm '"+compression+"'!")
  }
  if(outputEncoding === "utf-8"){
    return outputBuffer.toString("utf-8");
  }else if(outputEncoding==="hex"){
    return outputBuffer.toString("hex")
  }else if(outputEncoding==="base64"){
    return outputBuffer.toString("base64");
  }else if(outputEncoding==="binary"){
    return outputBuffer;
  }else{
    throw new Error("Unsupported row result data output encoding '"+outputEncoding+"'!")
  }
}

module.exports = {
  decompressAndDecodeRowResultData,
}