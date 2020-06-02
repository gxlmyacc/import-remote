

module.exports = function ({
  version,
  moduleWebpackPlugin: { scopeName, entryFile, chunks, externals, publicPath, entrys }
}) {
  const data = {
    version,
    entryFile,
    scopeName,
    publicPath,
    externals,
    jsChunk: chunks.files.js,
    cssChunk: chunks.files.css,
    entrys: {
      css: entrys.css.map(v => v.file),
      js: entrys.js.filter(v => !v.isRuntime).map(v => v.file),
      ids: entrys.ids.filter(v => !v.isRuntime).map(v => v.id),
    }
  };
  return `module.exports=function(){return ${JSON.stringify(data)};}`;
};

