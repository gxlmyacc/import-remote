const path = require('path');
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const config = {
  entry: path.resolve(__dirname, '../src/index.js'),
  mode: 'production', // development
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'import-remote.min.js',
    library: 'importRemote',
    libraryTarget: 'umd',
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    // new BundleAnalyzerPlugin({
    //   enable: true,
    //   openAnalyzer: false,
    //   analyzerMode: 'static',
    //   reportFilename: path.resolve(__dirname, '../analyzer/report.html'),
    // })
  ]
};

module.exports = config;
