import {SmartEOSAPIURLManager} from './SmartEOSAPIURLManager';


class SmartEOSAPI {
  constructor(rpcGenerator, apiUrls){
    this.rpcGenerator = rpcGenerator;
    this.urlManager = new SmartEOSAPIURLManager(apiUrls);
  }
  addAPIUrl(apiUrl) {
    return this.urlManager.addAPIUrl(apiUrl);
  }

  getAPIUrl() {
    return this.urlManager.getAPIUrl();
  }
  getUrlManager() {
    return this.urlManager;
  }

  get_table_rows(options) {
    const apiUrl = this.getAPIUrl();
    const rpc = this.rpcGenerator(apiUrl);
    const startTime = Date.now();
    return rpc.get_table_rows(options)
    .then((result)=>{
      const endTime = Date.now();

      let size = 0;
      try {
        size = JSON.stringify(result).length;
      }catch(err){
        size = 20000;
      }
      this.urlManager.reportResult(apiUrl, "get_table_rows", "ok", endTime-startTime, size);
      return result;
    });
  }

}

export {
  SmartEOSAPI,
}