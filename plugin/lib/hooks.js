// @ts-check
/** @typedef {import("../typings").Hooks} ModuleWebpackPluginHooks */


/**
 * This file provides access to all public ModuleWebpackPlugin hooks
 */

/** @typedef {import("webpack/lib/Compilation.js")} WebpackCompilation */
/** @typedef {import("../index.js")} ModuleWebpackPlugin */

const AsyncSeriesWaterfallHook = require('tapable').AsyncSeriesWaterfallHook;

// The following is the API definition for all available hooks
// For the TypeScript definition, see the Hooks type in typings.d.ts
/**
  beforeAssetTagGeneration:
    AsyncSeriesWaterfallHook<{
      assets: {
        publicPath: string,
        js: Array<string>,
        css: Array<string>,
        favicon?: string | undefined,
        manifest?: string | undefined
      },
      outputName: string,
      plugin: ModuleWebpackPlugin
    }>,
  alterAssetTags:
    AsyncSeriesWaterfallHook<{
      assetTags: {
        scripts: Array<HtmlTagObject>,
        styles: Array<HtmlTagObject>,
        meta: Array<HtmlTagObject>,
      },
      outputName: string,
      plugin: ModuleWebpackPlugin
    }>,
  alterAssetTagGroups:
    AsyncSeriesWaterfallHook<{
      outputName: string,
      plugin: ModuleWebpackPlugin
    }>,
  afterTemplateExecution:
    AsyncSeriesWaterfallHook<{
      html: string,
      outputName: string,
      plugin: ModuleWebpackPlugin,
    }>,
  beforeEmit:
    AsyncSeriesWaterfallHook<{
      html: string,
      outputName: string,
      plugin: ModuleWebpackPlugin,
    }>,
  afterEmit:
    AsyncSeriesWaterfallHook<{
      outputName: string,
      plugin: ModuleWebpackPlugin
    }>
*/

/**
 * @type {WeakMap<WebpackCompilation, ModuleWebpackPluginHooks>}}
 */
const moduleWebpackPluginHooksMap = new WeakMap();

/**
 * Returns all public hooks of the html webpack plugin for the given compilation
 *
 * @param {WebpackCompilation} compilation
 * @returns {ModuleWebpackPluginHooks}
 */
function getModuleWebpackPluginHooks(compilation) {
  let hooks = moduleWebpackPluginHooksMap.get(compilation);
  // Setup the hooks only once
  if (hooks === undefined) {
    hooks = createModuleWebpackPluginHooks();
    moduleWebpackPluginHooksMap.set(compilation, hooks);
  }
  return hooks;
}

/**
 * Add hooks to the webpack compilation object to allow foreign plugins to
 * extend the ModuleWebpackPlugin
 *
 * @returns {ModuleWebpackPluginHooks}
 */
function createModuleWebpackPluginHooks() {
  return {
    beforeAssetTagGeneration: new AsyncSeriesWaterfallHook(['pluginArgs']),
    alterAssetTags: new AsyncSeriesWaterfallHook(['pluginArgs']),
    alterAssetTagGroups: new AsyncSeriesWaterfallHook(['pluginArgs']),
    afterTemplateExecution: new AsyncSeriesWaterfallHook(['pluginArgs']),
    beforeEmit: new AsyncSeriesWaterfallHook(['pluginArgs']),
    afterEmit: new AsyncSeriesWaterfallHook(['pluginArgs'])
  };
}

module.exports = {
  getModuleWebpackPluginHooks
};
