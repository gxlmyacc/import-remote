const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  entry: {
    index: './src/index'
  },
  target: ['web', 'es5'],
  mode: ['development', 'production'][0],
  devtool: 'source-map',
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    port: 3001,
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
    ],
  },
  resolve: {
    alias: {
      'import-remote': path.resolve(__dirname, '../../../'),
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html'
    }),
  ],
};
