import './index.css';
import {loadAllResources} from './bootloader';

loadAllResources()
.then(()=>{
  console.log("Loaded!");
  require('./reactApp').runApp();
})
.catch((err)=>{
  console.error("ERROR loading resources: ",err)
})