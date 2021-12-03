const HtmlWebpackPlugin = require('html-webpack-plugin');
const ImportRemotePlugin = require('import-remote/plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { ModuleFederationPlugin } = require('webpack').container;
const path = require('path');
const webpack = require('webpack');
const evalSourceMapMiddleware = require('react-dev-utils/evalSourceMapMiddleware');
const errorOverlayMiddleware = require('./build/errorOverlayMiddleware');

const useMinicss = false;

const cssRegex = /\.css$/;
// common function to get style loaders
const getStyleLoaders = (cssOptions, preProcessor, preOptions) => {
  const loaders = [
    useMinicss ? {
      loader: MiniCssExtractPlugin.loader,
      options: Object.assign(
        {}
      ),
    } : null,
    {
      loader: require.resolve('css-loader'),
      options: cssOptions,
    },
    // {
    //     // Options for PostCSS as we reference these options twice
    //     // Adds vendor prefixing based on your specified browser support in
    //     // package.json
    //     loader: require.resolve('postcss-loader'),
    //     options: {
    //         sourceMap: true,
    //     },
    // },
  ].filter(Boolean);
  if (preProcessor) {
    loaders.push({
      loader: require.resolve(preProcessor),
      options: Object.assign({
        sourceMap: true,
      }, preOptions),
    });
  }
  return loaders;
};

const devServerOpt = {
  hot: true,
  host: '0.0.0.0',
  port: 3001,
  allowedHosts: 'all',
  client: {
    overlay: false,
    logging: 'none',
  },
  static: {
    directory: path.join(__dirname, 'dist'),
    publicPath: '/',
  },
  devMiddleware: {
    index: true,
    writeToDisk: true,
  },
  headers: { 'Access-Control-Allow-Origin': '*' },
  onBeforeSetupMiddleware(server) {
    const app = server.app;
    // This lets us fetch source contents from webpack for the error overlay
    app.use(evalSourceMapMiddleware(server));
    // This lets us open files from the runtime error overlay.
    app.use(errorOverlayMiddleware());
  },
};

const config = {
  devtool: 'eval',
  entry: {
    index: './src/index',
    test: './src/test'
  },
  mode: ['production', 'development'][1],
  output: {
    publicPath: 'http://localhost:3001/',
    filename: 'assets/[name]-[contenthash:5].js',
    chunkFilename: 'assets/[name]-[contenthash:5].js',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: ['@babel/preset-react'],
        },
      },
      {
        test: cssRegex,
        rules: getStyleLoaders({
          importLoaders: 1,
          sourceMap: true,
        }),
        // Don't consider CSS imports dead code even if the
        // containing package claims to have no side effects.
        // Remove this when webpack adds a warning or an error for this.
        // See https://github.com/webpack/webpack/issues/6571
        sideEffects: true,
      },
      {
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'assets/[name].[hash:8].[ext]',
        },
      },
      {
        test: /\.(woff|eot|ttf|svg|otf)\??.*$/,
        // exclude: /node_modules/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'assets/[name].[hash:8].[ext]',
        },
      },
    ],
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
    // runtimeChunk: true,
  },
  // externals: [{
  //   react: {
  //     root: 'React',
  //     amd: 'react',
  //     commonjs2: 'react',
  //     commonjs: 'react',
  //   },
  //   'react-dom': {
  //     root: 'ReactDOM',
  //     amd: 'react-dom',
  //     commonjs2: 'react-dom',
  //     commonjs: 'react-dom',
  //   },
  // }],
  devServer: devServerOpt,
  // http://localhost:3002/remoteEntry.js
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new ModuleFederationPlugin({
      name: 'app1',
      filename: 'remoteEntry.js',
      exposes: {
        './Slides': './src/Slides',
      },
      remotes: {
        app2: 'app2@http://localhost:3003/remoteEntry.js',
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true }
      },
    }),

    new ImportRemotePlugin({
      filename: 'index.js',
      shareModules: [
        // {
        //   name: 'react',
        //   version: (v, m, utils) => utils.versionLt('16.8.0', v) // : ['16.8.0', '17']
        // },
        'react',
        'react-dom',
        /dpl\.css$/
      ],
      chunks: ['index']
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      scriptLoading: 'blocking',
      chunks: ['index']
    }),
    useMinicss
      ? new MiniCssExtractPlugin({
        filename: 'assets/[name]-[contenthash:5].css',
        chunkFilename: 'assets/[name]-[contenthash:5].chunk.css'
      })
      : null
  ].filter(Boolean),
};

// const oldEntry = config.entry;
// const newEntry = {};

// Object.keys(oldEntry).forEach(item => {
//   newEntry[item] = [
//     require.resolve('./build/webpackHotDevClient'),
//     oldEntry[item]
//   ];
// });

// Object.keys(config.entry).forEach(key => {
//   config.entry[key] = `${config.entry[key]}?${createDomain(devServerOpt)}`
// });

module.exports = config;
