const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const ImportRemotePlugin = require('import-remote/plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const entryList = ['app', 'button'];

module.exports = {
  entry: entryList.reduce((p, entry) => {
    p[entry] = `./src/${entry}.js`;
    return p;
  }, {
    index: './src/index.js'
  }),
  mode: ['development', 'production'][0],
  devtool: 'eval-source-map',
  target: ['web', 'es5'],
  devServer: {
    historyApiFallback: false,
    host: '0.0.0.0',
    port: 3003,
    allowedHosts: 'all',
    client: {
      overlay: false,
      logging: 'none',
    },
    static: {
      directory: path.join(__dirname, 'dist'),
      publicPath: '/',
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept, X-Requested-With',
    },
  },
  output: {
    publicPath: '/',
    filename: 'assets/[name]-[contenthash:5].js',
    chunkFilename: 'assets/[name]-[contenthash:5].js',
    // libraryTarget: 'umd',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: [
            '@babel/preset-react'
          ],
        },
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.scss$/i,
        use: [
          MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'fast-sass-loader',
        ],
      },
      {
        test: /\.less$/i,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          {
            loader: require.resolve('less-loader'),
            options: {
              lessOptions: {
                javascriptEnabled: true,
              },
            },
          },
        ],
      }
    ],
  },
  // externals: [/antd\.css$/, 'react', 'react-dom', 'prop-types', 'antd'],
  // externals: {
  //   react: 'React'
  // },
  plugins: [
    new MiniCssExtractPlugin(),
    ...(entryList.map(entry => new ImportRemotePlugin({
      filename: `${entry}.js`,
      libraryFileName: true,
      entryFileName: true,
      shareModules: [
        // {
        //   name: 'react',
        //   version: (v, m, utils) => utils.versionLt('16.8.0', v) // : ['16.8.0', '17']
        // },
        'react',
        'react-dom',
        'prop-types'
      ],
      chunks: [entry],
      beforeSource: source => {
        console.log('source', source);
        return source.replace('dd');
      }
    }))),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html'
    }),
  ],
};
