const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: {
    index: './src/index'
  },
  target: ['web', 'es5'],
  mode: ['development', 'production'][0],
  devtool: 'eval-source-map',
  target: ['web', 'es5'],
  devServer: {
    historyApiFallback: false,
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
  plugins: [
    new MiniCssExtractPlugin(),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html'
    }),
  ],
};
