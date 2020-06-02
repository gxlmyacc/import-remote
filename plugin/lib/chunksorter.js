// @ts-check
/** @typedef {import("webpack/lib/Compilation.js")} WebpackCompilation */


/**
 * @type {{[sortmode: string] : (entryPointNames: Array<string>, compilation, moduleWebpackPluginOptions) => Array<string> }}
 * This file contains different sort methods for the entry chunks names
 */
module.exports = {};

/**
 * Performs identity mapping (no-sort).
 * @param  {Array} chunks the chunks to sort
 * @return {Array} The sorted chunks
 */
module.exports.none = chunks => chunks;

/**
 * Sort manually by the chunks
 * @param  {string[]} entryPointNames the chunks to sort
 * @param  {WebpackCompilation} compilation the webpack compilation
 * @param  moduleWebpackPluginOptions the plugin options
 * @return {string[]} The sorted chunks
 */
module.exports.manual = (entryPointNames, compilation, moduleWebpackPluginOptions) => {
  const chunks = moduleWebpackPluginOptions.chunks;
  if (!Array.isArray(chunks)) {
    return entryPointNames;
  }
  // Remove none existing entries from
  // moduleWebpackPluginOptions.chunks
  return chunks.filter(entryPointName => compilation.entrypoints.has(entryPointName));
};

/**
 * Defines the default sorter.
 */
module.exports.auto = module.exports.none;
