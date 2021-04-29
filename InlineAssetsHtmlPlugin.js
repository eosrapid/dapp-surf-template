const HtmlWebpackPlugin = require('html-webpack-plugin')

const InlineTypes = [
  { assetTagName: 'script', srcAttr: 'src', inlineTagName: 'script' },
  { assetTagName: 'link', srcAttr: 'href', inlineTagName: 'style' }
]

const PluginName = 'InlineAssetsHtmlPlugin'

class InlineAssetsHtmlPlugin {
  constructor(options = {}) {
    if (!options.test) throw Error(`${PluginName}: option 'test' is required.`)
    this.options = options
  }

  resolveTag(publicPath, assets, tag) {
    const inlineType = InlineTypes.find((type) => type.assetTagName === tag.tagName && !!tag.attributes[type.srcAttr])
    if (!inlineType) return tag

    const src = tag.attributes[inlineType.srcAttr]
    const assetName = publicPath ? src.replace(publicPath, '') : src
    //console.log(assetName);
    const asset = assets[assetName]
    if (!asset) return tag
    if (!this.options.test.test(assetName)) return tag

    return { tagName: inlineType.inlineTagName, innerHTML: asset.source(), closeTag: true }
  }

  apply(compiler) {
    let publicPath = compiler.options.output.publicPath || ''
    if (publicPath && !publicPath.endsWith('/')) publicPath += '/'

    compiler.hooks.compilation.tap(PluginName, (compilation) => {
      const tagFunction = (tag) => this.resolveTag(publicPath, compilation.assets, tag)
      const hooks = HtmlWebpackPlugin.getHooks(compilation)
      hooks.alterAssetTagGroups.tap(PluginName, (assets) => {
        assets.headTags = assets.headTags.map(tagFunction)
        assets.bodyTags = assets.bodyTags.map(tagFunction)
      })

      if (this.options.emit) return
      compiler.hooks.emit.tap(PluginName, () => {
        Object.keys(compilation.assets).forEach((name) => {
          if (this.options.test.test(name)) delete compilation.assets[name]
        })
      })
    })
  }
}

module.exports = InlineAssetsHtmlPlugin