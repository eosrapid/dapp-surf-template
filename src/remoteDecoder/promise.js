async function tryAllPromises(promGenFuncs){
  let i = 0;
  for(;i<promGenFuncs.length;i++){
    try {
      await promGenFuncs[i]();
      return;
    }catch(error){
      if(i===promGenFuncs.length-1){
        throw error;
      }
    }
  }

}
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
export {
  tryAllPromises,
  loadOneByOnePromiseArray,
}