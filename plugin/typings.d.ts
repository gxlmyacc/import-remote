import { AsyncSeriesWaterfallHook } from "tapable";
import WebpackCompiler from 'webpack/lib/Compiler';

export = ModuleWebpackPlugin;

declare class ModuleWebpackPlugin {
  constructor(options?: ModuleWebpackPlugin.Options);

  apply(compiler: WebpackCompiler): void;
}

declare namespace ModuleWebpackPlugin {

  interface Options extends Partial<ProcessedOptions> { }

  interface TemplateAssets {
    publicPath: string,
    entryFile: string,
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
     * Default: `true`.
     */
    cache: boolean;
    /**
     * List all entries which should be injected
     */
    chunks: "all" | string[];
    /**
     * Allows to control how chunks should be sorted before they are included to the html.
     * Default: `'auto'`.
     */
    chunksSortMode:
    | "auto"
    | "manual"
    | (((entryNameA: string, entryNameB: string) => number));
    /**
     * List all entries which should not be injeccted
     */
    excludeChunks: string[];
    /**
     * The file to write the HTML to.
     * Defaults to `index.html`.
     * Supports subdirectories eg: `assets/admin.html`
     */
    filename: string;
    /**
     * If `true` then append a unique `webpack` compilation hash to all included scripts and CSS files.
     * This is useful for cache busting
     */
    hash: boolean;
    /**
     * Render errors into the HTML page
     */
    showErrors: boolean;
    /**
     * The `webpack` require path to the template.
     * @see https://github.com/jantimon/html-webpack-plugin/blob/master/docs/template-option.md
     */
    template: string;
    /**
     * Allow to use a html string instead of reading from a file
     */
    templateContent:
    | false // Use the template option instead to load a file
    | string
    | Promise<string>;
    /**
     * Allows to overwrite the parameters used in the template
     */
    templateParameters:
    | false // Pass an empty object to the template function
    | ((
      compilation: any,
      assets: TemplateAssets,
      options: ProcessedOptions,
      version: number,
    ) => { [option: string]: any } | Promise<{ [option: string]: any }>)
    | { [option: string]: any };
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
    compilation: any;
    package: any;
    globalObject: string;
    moduleWebpackPlugin: {
      scopeName: string,
      options: Options;
    } | TemplateAssets;
    webpackConfig: any;
  }

  interface Hooks {
    alterAssetTags: AsyncSeriesWaterfallHook<{
      assetTags: {
        scripts: HtmlTagObject[];
        styles: HtmlTagObject[];
      };
      outputName: string;
      plugin: ModuleWebpackPlugin;
    }>;

    alterAssetTagGroups: AsyncSeriesWaterfallHook<{
      headTags: HtmlTagObject[];
      bodyTags: HtmlTagObject[];
      outputName: string;
      plugin: ModuleWebpackPlugin;
    }>;

    afterTemplateExecution: AsyncSeriesWaterfallHook<{
      html: string;
      headTags: HtmlTagObject[];
      bodyTags: HtmlTagObject[];
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
