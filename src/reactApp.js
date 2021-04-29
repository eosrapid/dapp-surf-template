import { h, render } from 'preact';
import Router from 'preact-router';
import Home from '@/routes/home';
import Info from '@/routes/info';

/** @jsx h */
/*

render(<Main />, document.body);
*/


const Main = () => (
  <Router>
    <Home path="/" />
    <Info path="/info" />
  </Router>
);

const runApp = () => render(<Main />, document.getElementById('root'));
export {runApp};