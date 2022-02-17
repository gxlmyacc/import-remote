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
  devtool: 'source-map',
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
  // externals: [/antd\.css$/, 'react', 'react-dom', 'prop-types', 'antd'],
  plugins: [
    new MiniCssExtractPlugin(),
    ...(entryList.map(entry => new ImportRemotePlugin({
      filename: `${entry}.js`,
      libraryFileName: true,
      shareModules: [
        // {
        //   name: 'react',
        //   version: (v, m, utils) => utils.versionLt('16.8.0', v) // : ['16.8.0', '17']
        // },
        'react',
        'react-dom',
        'prop-types'
      ],
      chunks: [entry]
    }))),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html'
    }),
  ],
};
