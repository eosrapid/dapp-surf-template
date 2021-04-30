import {inflate} from 'pako';

function stringToUint8Array(str){
  const len = str.length;
  const uint8Array = new Uint8Array(len);
  for(let i=0;i<len;i++){
    uint8Array[i] = str.charCodeAt(i);
  }
  return uint8Array;
}

function decodeRowResultData(data, encoding) {
  if(encoding === "utf-8"){
    return data;
  }else if(encoding === "hex"){
    throw new Error("hex storage encoding not currently implemented for client side decoding!")
    //return Buffer.from(data, 'hex');
  }else if(encoding === "base64"){
    return atob(data);
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
      return inflate(stringToUint8Array(decodedDataBuffer), {to: 'string'});
    }
    outputBuffer = inflate(stringToUint8Array(outputBuffer))
  }else if(compression === "none"){
    outputBuffer = decodedDataBuffer;
  }else{
    throw new Error("Unsupported row result data compression algorithm '"+compression+"'!")
  }
  if(outputEncoding === "utf-8"){
    return outputBuffer.toString();
  }else if(outputEncoding==="hex"){
    throw new Error("hex output encoding not currently implemented for client side decoding!")
  }else if(outputEncoding==="base64"){
    return btoa(outputBuffer.toString());
  }else if(outputEncoding==="binary"){
    throw new Error("binary output encoding not currently implemented for client side decoding!")
  }else{
    throw new Error("Unsupported row result data output encoding '"+outputEncoding+"'!")
  }
}

export {
  decompressAndDecodeRowResultData,
}