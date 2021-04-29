import { Link } from 'preact-router';
import React from 'react';
import {infoPage} from './Info.module.scss';
const Info = ()=>{
  return <div className={infoPage}>
    <h1>Info Page</h1>
    <h3>This is an example of how routes work in dApp Surf</h3>
    <div>
      Go Back to <Link href="/">Home</Link>
    </div>
    
  </div>
};

export default Info;