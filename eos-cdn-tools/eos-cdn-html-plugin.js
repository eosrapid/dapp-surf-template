const HtmlWebpackPlugin = require('html-webpack-plugin')

function generateTagForFinalConfig(finalConfigObject){
  return {
    tagName: 'script',
    innerHTML: `window.cdnResources=${JSON.stringify(finalConfigObject)};`,
    closeTag: true,
  };
}

const PluginName = 'EOSCDNHTMLPlugin'
class EOSCDNHTMLPlugin {
  constructor(options = {}) {
    if (!Array.isArray(options.resources)) throw Error(`${PluginName}: option 'test' is required.`)
    this.options = options;
  }
  apply(compiler) {
    console.log('compiler.options: ',compiler.options);
    console.log(Object.keys(compiler.options));


    compiler.hooks.compilation.tap(PluginName, (compilation) => {
      const hooks = HtmlWebpackPlugin.getHooks(compilation);
      hooks.alterAssetTagGroups.tapAsync(PluginName, (assets, callback) => {
        /*assets.headTags = assets.headTags.map(tagFunction)
        assets.bodyTags = assets.bodyTags.map(tagFunction)*/

        assets.bodyTags = [
          generateTagForFinalConfig(this.options.resources),
        ].concat(assets.bodyTags).concat([
          {
            tagName: 'script',
            innerHTML: `console.log("Last one!");`,
            closeTag: true,
          }
        ])
        callback()
      })
    })
  }
}

module.exports = EOSCDNHTMLPlugin