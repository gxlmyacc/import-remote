const _toString = Object.prototype.toString;
function isRegExp(obj) {
  return _toString.call(obj) === '[object RegExp]';
}

module.exports = function ({
  version,
  pkg,
  timestamp,
  outputOptions,
  webpackVersion,
  webpackConfig,
  moduleWebpackPlugin: {
    scopeName, entryFile, entryId, hash, jsonpFunction, remotes, shareModules, batchReplaces,
    hot, chunks, externals, publicPath, entrys, options
  }
}) {
  const filterEntry = (entry, isId) => {
    let ret = !options.runtimeChunk || !entry.isRuntime;
    if (ret && isId && remotes.chunkToModuleMapping && remotes.chunkToModuleMapping[entry.id]) ret = false;
    return ret;
  };
  const data = {
    timestamp,
    name: pkg.name,
    version,
    webpackVersion,
    mode: webpackConfig.mode,
    devtool: webpackConfig.devtool,
    libraryTarget: webpackConfig.output.libraryTarget,
    moduleVersion: pkg.version,
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
      js: entrys.js.filter(v => filterEntry(v)).map(v => (v.file.indexOf(publicPath) === 0 ? v.file.replace(publicPath, '') : v.file)),
      ids: entrys.ids.filter(v => filterEntry(v, true)).map(v => v.id),
    },
    meta: options.meta || {}
  };
  if (options.globalToScopes && options.globalToScopes.length) data.globalToScopes = options.globalToScopes;
  if (batchReplaces && batchReplaces.length) data.batchReplaces = batchReplaces;
  if (options.commonModules) data.commonModules = options.commonModules;
  if (options.sourcemapHost) data.sourcemapHost = options.sourcemapHost;
  return `module.exports=function(){return ${JSON.stringify(data, (key, value) => {
    if (typeof value === 'function') {
      let str = value.toString();
      let [, args = '', bracketL, body = '', bracketR] = str.match(/^(?:(?:function)?\s?[A-Za-z0-9_$]*\s?)?\(([A-Za-z0-9_$\s,]*)\)\s*(?:=>\s*)?({?)((?:.|\n)*)(}?)$/) || [];
      if (bracketL === '{' && !bracketR && body.endsWith('}')) {
        bracketR = '}';
        body = body.substr(0, body.length - 1).trim();
      }
      return {
        _t: 'f',
        _v: [
          args.replace(/\s+/g, '').split(',').map(a => a.trim()).filter(Boolean),
          body.trim().replace(/\b(let|const)\b/g, 'var'),
          bracketR].filter(Boolean)
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

