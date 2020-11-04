

module.exports = function ({
  globalObject,
  version,
  pkg,
  webpackConfig,
  moduleWebpackPlugin: {
    scopeName, entryFile, entryId, hash, modulesMapFile, jsonpFunction, 
    hot, chunks, externals, publicPath, entrys, options 
  }
}) {
  const data = {
    name: pkg.name,
    version,
    mode: webpackConfig.mode,
    libraryTarget: webpackConfig.output.libraryTarget,
    moduleVersion: pkg.version,
    modulesMapFile,
    hash,
    hot,
    nodeModulesPath: options.nodeModulesPath,
    globalToScopes: options.globalToScopes || [],
    entryFile,
    entryId,
    globalObject,
    jsonpFunction,
    scopeName,
    publicPath,
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

