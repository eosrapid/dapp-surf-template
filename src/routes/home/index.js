import React from 'react';
import {homePage} from './Home.module.scss';
import TestPageA from '../../components/TestPageA/TestPageA';

const Home = ()=>{
  return <div className={homePage}>
    <TestPageA />
  </div>
};

export default Home;