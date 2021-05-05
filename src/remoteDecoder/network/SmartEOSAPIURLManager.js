function updateSegmentedResultData(segData, status, duration, size) {
  segData.averageTime = (segData.averageTime*segData.requests+duration)/(segData.requests+1);
  segData.requests++;
  if(status !== "ok"){
    segData.errors++;
    segData.errorPct = segData.errors/segData.requests;
  }else{
    segData.averageTimeOk = (segData.averageTimeOk*segData.requestsOk+duration)/(segData.requestsOk+1);
    segData.averageTimeOkSizeAdjusted = (segData.averageTimeOkSizeAdjusted * segData.requestsOk+(duration/size))/(segData.requestsOk+1);
    segData.requestsOk++;
  }
  if(duration>segData.maxTime){
    segData.maxTime = duration;
  }
  if(duration<segData.minTime){
    segData.minTime = duration;
  }
}
function compareAPIUrlResults(resultA, resultB) {
  if(resultA.requestsOk === 0){
    return 1;
  }else if(resultB.requestsOk === 0) {
    return -1;
  }
  return resultA.averageTimeOk - resultB.averageTimeOk;
}
class SmartEOSAPIURLManager {
  constructor(apiUrls){
    this.apiUrls = Array.isArray(apiUrls)?apiUrls:[];
    this.apiUrlResults = {};
    this.apiUrls.forEach(url=>this.addAPIUrl(url));
  }
  addAPIUrl(apiUrl){
    if(this.apiUrlResults.hasOwnProperty(apiUrl)){
      return false;
    }
    this.apiUrlResults = {
      url: apiUrl,
      data: {
        _all_: {
          errors: 0,
          requestsOk: 0,
          requests: 0,
          errorPct: 0,
          averageTimeOk: 0,
          averageTime: 0,
          maxTime: 0,
          minTime: 999999999,
          averageTimeOkSizeAdjusted: 0, // ms/byte
        },
        get_table_rows: {
          errors: 0,
          requestsOk: 0,
          requests: 0,
          errorPct: 0,
          averageTimeOk: 0,
          averageTime: 0,
          maxTime: 0,
          minTime: 999999999,
          averageTimeOkSizeAdjusted: 0, // ms/byte
        },
      },
    };
    return true;
  }
  reportResult(url, type, status, duration, size){
    if(!this.apiUrlResults.hasOwnProperty(url)){
      return false;
    }
    const urlDef = this.apiUrlResults[url];
    if(!urlDef.data.hasOwnProperty(type)){
      return false;
    }
    updateSegmentedResultData(urlDef.data[type], status, duration, size);
    updateSegmentedResultData(urlDef.data._all_, status, duration, size);
    this.apiUrls = this.apiUrls.sort(compareAPIUrlResults);
    return true;
  }
  getAPIUrl(){
    return this.apiUrls[0];
  }
}

export {
  SmartEOSAPIURLManager,
}