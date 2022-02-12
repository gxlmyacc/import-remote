import { AsyncSeriesWaterfallHook } from "tapable";
import WebpackCompiler from 'webpack/lib/Compiler';
import WebpackCompilation from 'webpack/lib/Compilation';

export = ModuleWebpackPlugin;

declare class ModuleWebpackPlugin {
  constructor(options?: ModuleWebpackPlugin.Options);

  apply(compiler: WebpackCompiler): void;

  static getHooks(compilation: WebpackCompilation): ModuleWebpackPlugin.Hooks;

  static readonly version: number;
}

declare namespace ModuleWebpackPlugin {

  interface Options extends Partial<ProcessedOptions> { }

  interface TemplateAssets {
    publicPath: string,
    entryFile: string|string[],
    entryId: string|number|string[]|number[],
    hash: string,
    jsonpFunction: string,
    hot: boolean,
    shareModules: Array<any>,
    batchReplaces: Array<any>,
    remotes: {},
    externals: Array<any>,
    chunks: {
      files: {
        js: any,
        css: any,
      }
    },
    entrys: {
      ids: Array<{ id: string|number, isRuntime: boolean, isEntry: boolean }>,
      js: Array<{ file: string, isRuntime: boolean, isEntry: boolean }>,
      css: Array<{ file: string, isEntry: boolean }>,
    },
    manifest?: string,
    runtime?: { file: string, source: string },
  }

  /**
   * The plugin options after adding default values
   */
  interface ProcessedOptions {
    /**
     * Emit the file only if it was changed.
     * @default true
     */
    cache: boolean;
    /**
     * common module
     */
    commonModules?: { name?: string, url: string, host?: string, scoped?: boolean };

    batchReplaces?: {
      [key: string]: [RegExp, string][]|((
        self: ModuleWebpackPlugin,
        compilation: WebpackCompilation,
        options: ProcessedOptions,
        isEval: boolean) => [RegExp, string][])
    };

    runtimeChunk?: boolean;
    /**
     * List all entries which should be injected
     */
    chunks?: "all" | string[];
    /**
     * Allows to control how chunks should be sorted before they are included to the html.
     * @default 'auto'
     */
    chunksSortMode?:
    | "auto"
    | "manual"
    | (((entryNameA: string, entryNameB: string) => number));
    /**
     * List all entries which should not be injected
     */
    excludeChunks?: string[];
    /**
     * The file to write the HTML to.
     * Defaults to `index.html`.
     * Supports subdirectories eg: `assets/admin.html`
     * @default 'auto'
     */
    filename?: string;
    /**
     * The file path of import-remote.min.js write to.
     * @default ''
     */
    libraryFileName?: string|boolean;
    libraryWithMap?: boolean;
    /**
     * If `true` then append a unique `webpack` compilation hash to all included scripts and CSS files.
     * This is useful for cache busting
     */
    hash?: boolean;
    /**
     * Render errors into the HTML page
     */
    showErrors?: boolean;
    /**
     * The `webpack` require path to the template.
     * @see https://github.com/jantimon/html-webpack-plugin/blob/master/docs/template-option.md
     */
    template?: string;
    /**
     * Allow to use a html string instead of reading from a file
     */
    templateContent?:
    | false // Use the template option instead to load a file
    | string
    | Promise<string>;
    /**
     * Allows to overwrite the parameters used in the template
     */
    templateParameters?:
    | false // Pass an empty object to the template function
    | ((
      compilation: any,
      assets: TemplateAssets,
      options: ProcessedOptions,
      version: number,
    ) => { [option: string]: any } | Promise<{ [option: string]: any }>)
    | { [option: string]: any };

    globalToScopes?: string[];
    /**
     * The `webpack` require path to the template.
     */
    sourcemapHost?: string|Function;
    /**
     * In addition to the options actually used by this plugin, you can use this hash to pass arbitrary data through
     * to your template.
     */
    [option: string]: any;
  }

  /**
   * The values which are available during template execution
   *
   * Please keep in mind that the `templateParameter` options allows to change them
   */
  interface TemplateParameter {
    version: number,
    timestamp: number,
    compilation: any;
    pkg: any;
    moduleWebpackPlugin: {
      scopeName: string,
      options: Options;
    } | TemplateAssets;
    outputOptions: any,
    webpackVersion: number,
    webpackConfig: any;
    babelTransform: (str) => string
  }

  interface Hooks {
    alterAssetTags: AsyncSeriesWaterfallHook<{
      outputName: string;
      plugin: ModuleWebpackPlugin;
    }>;

    alterAssetTagGroups: AsyncSeriesWaterfallHook<{
      outputName: string;
      plugin: ModuleWebpackPlugin;
    }>;

    afterTemplateExecution: AsyncSeriesWaterfallHook<{
      html: string;
      outputName: string;
      plugin: ModuleWebpackPlugin;
    }>;

    beforeAssetTagGeneration: AsyncSeriesWaterfallHook<{
      assets: {
        publicPath: string;
        js: Array<string>;
        css: Array<string>;
        favicon?: string;
        manifest?: string;
      };
      outputName: string;
      plugin: ModuleWebpackPlugin;
    }>;

    beforeEmit: AsyncSeriesWaterfallHook<{
      html: string;
      outputName: string;
      plugin: ModuleWebpackPlugin;
    }>;

    afterEmit: AsyncSeriesWaterfallHook<{
      outputName: string;
      plugin: ModuleWebpackPlugin;
    }>;
  }

  /**
   * A tag element according to the ModuleWebpackPlugin object notation
   */
  interface HtmlTagObject {
    /**
     * Attributes of the html tag
     * E.g. `{'disabled': true, 'value': 'demo'}`
     */
    attributes: {
      [attributeName: string]: string | boolean;
    };
    /**
     * The tag name e.g. `'div'`
     */
    tagName: string;
    /**
     * The inner HTML
     */
    innerHTML?: string;
    /**
 * Whether this html must not contain innerHTML
 * @see https://www.w3.org/TR/html5/syntax.html#void-elements
 */
    voidTag: boolean;
  }
}
