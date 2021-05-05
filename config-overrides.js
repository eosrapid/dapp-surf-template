
const path = require('path');
const webpack = require('webpack');
const InlineAssetsHtmlPlugin = require('./InlineAssetsHtmlPlugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const svgToMiniDataURI = require('mini-svg-data-uri');
const configFinal = require('./src/.eoscdn.config.final.js');
const defaultEntrypoint = path.resolve(__dirname, 'src', 'index.js');
const devLocalEntrypoint = path.resolve(__dirname, 'src', 'devLocalEntrypoint.js');

function getMode(envType){
  return process.env.RAPID_CDN_MODE
}
function isLoaderType(loaderPath, loaderName){
  const loaderParts = loaderPath.split("/");
  console.log(loaderPath)
  return loaderParts.slice(loaderParts.lastIndexOf("node_modules")+1).indexOf(loaderName)!==-1;
}
function modifyRules(rulesList, testFunc, modifyFunc) {
  let modified = false;
  for(let i = 0; i<rulesList.length;i++){
    const ruleItem = rulesList[i];
    if(ruleItem && typeof ruleItem === 'object'){
      if(testFunc(ruleItem)){
        console.log('hiaa'+modifyFunc);
        modified = true;
        rulesList[i] = modifyFunc(ruleItem);
        console.log('hi3');
      }else if(Array.isArray(ruleItem.oneOf)){
        console.log('22aa');
        if(modifyRules(ruleItem.oneOf, testFunc, modifyFunc)){
          modified = true;
        }
      }
    }
  }
  return modified;
}
function processRules(config, env) {
  config.module = config.module || {};
  config.module.rules = config.module.rules || [];
  const buildMode = getMode(env);
  if(buildMode==="dev-local"){

  }else if(buildMode==="dev-cdn"){
    
  }else{
    config.module.rules[2].oneOf[0].options.limit = 1000*1000;
    config.module.rules[2].oneOf.splice(1,0,{
      test: /\.svg$/i,
      use: [
        {
          loader: 'url-loader',
          options: {
            generator: (content) => svgToMiniDataURI(content.toString()),
          },
        },
      ],
    });
  }

  /*
  modifyRules(
    config.module.rules,
    (rule)=>typeof rule === 'object' && rule && typeof rule.loader === 'string' && isLoaderType(rule.loader, 'url-loader'),
    (rule)=>{
      rule.options = rule.options || {};
      rule.options.limit = 1000*1000;
      return rule;
    }
  );
  config.module.rules = [
    {
      test: /\.svg$/i,
      use: [
        {
          loader: 'url-loader',
          options: {
            generator: (content) => svgToMiniDataURI(content.toString()),
          },
        },
      ],
    }
  ].concat(config.module.rules);*/
}

function processPlugins(config, env) {
  //console.log(config.module.rules[2].oneOf[0])
  // disable cache
  const buildMode = getMode(env);
  if(buildMode==="dev-local"){
    // none
  }else if(buildMode==="dev-cdn"){
    // none
  }else{
    const newPlugins = [new webpack.HashedModuleIdsPlugin()].concat(config.plugins || []);
    const inlineAssetsPluginInstance = new InlineAssetsHtmlPlugin({
      test: {
        test: (val) => {
          if (val.indexOf("__eosnpmbundle__") !== -1) {
            return false;
          } else {
            return /\.(css|js|json)$/.test(val);
          }
        },
      }, // Required: regexp test of files to inline,
      emit: false, // Optional: to emit the files that were inlined. Defaults to false (remove the files)
    });

    for(let i=0;i<newPlugins.length;i++){
      if(newPlugins[i] instanceof HtmlWebpackPlugin && newPlugins[i].options){
        //console.log('hiz');
        newPlugins[i].options.cache = false;
        //console.log(newPlugins[i].options.minify);
        //console.log(newPlugins);
        newPlugins.splice(i+1,0, inlineAssetsPluginInstance);
        break;
      }
    }
    config.plugins = newPlugins;
  }
}
function processExternals(config, env) {
  const buildMode = getMode(env);
  const baseExternals = {};
  if(buildMode==="dev-cdn"){
    config.externals = Object.assign(
      {},
      config.externals||{},
      baseExternals,
      configFinal.allExternals
    );  
  }else if(buildMode==="dev-local"){
    
  }else if(buildMode==="build-cdn"){
    baseExternals['pako'] = 'pako';  
    config.externals = Object.assign(
      {},
      config.externals||{},
      baseExternals,
      configFinal.allExternals
    );  
  }else if(buildMode==="build-local"){
    config.externals = Object.assign(
      {},
      config.externals||{},
      baseExternals,
      configFinal.allExternals
    );  
  }
}
function processOptimization(config, env) {
  const buildMode = getMode(env);
  if(buildMode==="dev-local"){

  }else if(buildMode==="dev-cdn"){

  }else{
    config.optimization.minimize = true;
  }
}
function processAliases(config, env) {
  config.resolve.alias["react"] = "preact/compat";
  config.resolve.alias["react-dom/test-utils"] = "preact/test-utils";
  config.resolve.alias["react-dom"] = "preact/compat";
  config.resolve.alias['@'] = path.resolve(__dirname, 'src');
}

function processEntrypoint(config, env) {
  const buildMode = getMode(env);

  if(buildMode === "dev-local"){
    if(Array.isArray(config.entry)){
      config.entry = config.entry.map(ep=>{
        if(ep === defaultEntrypoint){
          return devLocalEntrypoint;
        }else{
          return ep;
        }
      });
    }else if(config.entry === "string"){
      if(config.entry === defaultEntrypoint){
        config.entry = devLocalEntrypoint;
      }
    }
  }

}
module.exports = function override(config, env) {
  processEntrypoint(config, env);
  processExternals(config, env);
  config.output.jsonpFunction = 'eosweb';
  processPlugins(config, env);
  processOptimization(config, env);
  processAliases(config, env);
  processRules(config, env);
  
  
  return config;
}