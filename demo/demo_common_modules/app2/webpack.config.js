const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const ImportRemotePlugin = require('import-remote/plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');

const entryList = ['app', 'button'];

module.exports = {
  entry: entryList.reduce((p, entry) => {
    p[entry] = `./src/${entry}.js`;
    return p;
  }, {
    index: './src/index.js'
  }),
  devtool: 'source-map',
  mode: ['development', 'production'][0],
  target: ['web', 'es5'],
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    port: 3003,
    headers: { 'Access-Control-Allow-Origin': '*' },
    writeToDisk: true,
    useLocalIp: true,
    hot: true,
    overlay: false,
    quiet: true,
    host: '0.0.0.0',
    disableHostCheck: true,
    inline: true,
    stats: {
      colors: true,
    },
  },
  output: {
    publicPath: '/',
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
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
  externals: [/antd\.css$/, 'react', 'react-dom', 'prop-types', 'antd'],
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new MiniCssExtractPlugin(),
    ...(entryList.map(entry => new ImportRemotePlugin({
      filename: `${entry}.js`,
      libraryFileName: true,
      commonModules: [
        { name: '@basic-host-remote/common', url: 'http://localhost:3004/index.js' }
      ],
      chunks: [entry]
    }))),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html'
    }),
  ],
};
