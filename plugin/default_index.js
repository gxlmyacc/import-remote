

module.exports = function ({
  globalObject,
  version,
  pkg,
  outputOptions,
  webpackVersion,
  webpackConfig,
  moduleWebpackPlugin: {
    scopeName, entryFile, entryId, hash, modulesMapFile, jsonpFunction, remotes, shared,
    hot, chunks, externals, publicPath, entrys, options 
  }
}) {
  const data = {
    timestamp: Date.now(),
    name: pkg.name,
    version,
    webpackVersion,
    mode: webpackConfig.mode,
    devtool: webpackConfig.devtool,
    libraryTarget: webpackConfig.output.libraryTarget,
    moduleVersion: pkg.version,
    modulesMapFile,
    hash,
    hot,
    nodeModulesPath: options.nodeModulesPath,
    globalToScopes: options.globalToScopes || [],
    entryFile,
    entryId,
    windowObject: webpackConfig.output.globalObject,
    globalObject,
    jsonpFunction,
    hotUpdateGlobal: outputOptions.hotUpdateGlobal,
    uniqueName: webpackConfig.output.uniqueName || '',
    scopeName,
    publicPath,
    shared,
    remotes,
    externals,
    jsChunks: chunks.files.js,
    cssChunks: chunks.files.css,
    entrys: {
      css: entrys.css.map(v => (v.file.indexOf(publicPath) === 0 ? v.file.replace(publicPath, '') : v.file)),
      js: entrys.js.filter(v => !v.isRuntime).map(v => (v.file.indexOf(publicPath) === 0 ? v.file.replace(publicPath, '') : v.file)),
      ids: entrys.ids.filter(v => !v.isRuntime).map(v => v.id),
    },
    meta: options.meta || {}
  };
  if (options.commonModules) data.commonModules = options.commonModules;
  return `module.exports=function(){return ${JSON.stringify(data)};};module.exports['iref']=true;`;
};

