

module.exports = function ({
  version,
  pkg,
  moduleWebpackPlugin: {
    scopeName, entryFile, entryId, hash, modulesMapFile, jsonpFunction, 
    hot, chunks, externals, publicPath, entrys, options 
  }
}) {
  const data = {
    name: pkg.name,
    version,
    moduleVersion: pkg.version,
    modulesMapFile,
    hash,
    hot,
    nodeModulesPath: options.nodeModulesPath,
    entryFile,
    entryId,
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
  return `module.exports=function(){return ${JSON.stringify(data)};}`;
};

