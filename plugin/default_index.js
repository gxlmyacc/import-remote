const _toString = Object.prototype.toString;
function isRegExp(obj) {
  return _toString.call(obj) === '[object RegExp]';
}

module.exports = function ({
  globalObject,
  version,
  pkg,
  outputOptions,
  webpackVersion,
  webpackConfig,
  moduleWebpackPlugin: {
    scopeName, entryFile, entryId, hash, modulesMapFile, jsonpFunction, remotes, shareModules, batchReplaces, globalToScopes,
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
    entryFile,
    entryId,
    windowObject: webpackConfig.output.globalObject,
    globalObject: '__context__',
    jsonpFunction,
    hotUpdateGlobal: outputOptions.hotUpdateGlobal,
    uniqueName: webpackConfig.output.uniqueName || '',
    scopeName,
    publicPath,
    shareModules,
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
  if (globalToScopes && globalToScopes.length) data.globalToScopes = globalToScopes;
  if (batchReplaces && batchReplaces.length) data.batchReplaces = batchReplaces;
  if (options.commonModules) data.commonModules = options.commonModules;
  return `module.exports=function(){return ${JSON.stringify(data, (key, value) => {
    if (typeof value === 'function') {
      let str = value.toString();
      let [, args = '', body = '', bracket] = str.match(/^(?:(?:function)?\s?[A-Za-z0-9_$]*\s?)?\(([A-Za-z0-9_$\s,]*)\)\s*(?:=>\s*)?{((?:.|\n)*)(})$/) || [];
      return {
        _t: 'f',
        _v: [
          args.replace(/\s+/g, '').split(',').map(a => a.trim()).filter(Boolean),  
          body.trim().replace(/\b(let|const)\b/g, 'var'), 
          bracket].filter(Boolean)
      };
    }
    if (isRegExp(value)) {
      let ret = { _t: 'r', _v: value.source };
      if (value.flags) ret._f = value.flags;
      return ret;
    }
    if (value instanceof Date) {
      return {
        _t: 'd',
        _v: value.toISOString()
      };
    }
    return value;
  })};};module.exports['iref']=true;`;
};

