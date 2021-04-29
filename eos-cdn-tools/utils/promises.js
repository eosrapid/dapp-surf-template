function loadOneByOnePromiseArray(generatorList){
  return new Promise((resolve, reject)=>{
    let currentIndex = -1;
    const results = [];
    const listLength = generatorList.length;
    function runNextGenerator(){
      currentIndex++;
      if(currentIndex>=listLength){
        return resolve(results);
      }
      generatorList[currentIndex]()
      .then((result)=>{
        results[currentIndex] = result;
        runNextGenerator();
      })
      .catch(error=>{
        return reject(error);
      })
    }
    runNextGenerator();
  });
}

module.exports = {
  loadOneByOnePromiseArray,
}