const path = require('path');
const ImportRemotePlugin = require('import-remote/plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const entryList = ['index'];

module.exports = {
  entry: entryList.reduce((p, entry) => {
    p[entry] = `./src/${entry}.js`;
    return p;
  }, {
    index: './src/index.js'
  }),
  mode: ['development', 'production'][0],
  target: ['web', 'es5'],
  devtool: 'source-map',
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    port: 3004,
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
  plugins: [
    new MiniCssExtractPlugin(),
    ...(entryList.map(entry => new ImportRemotePlugin({
      filename: `${entry}.js`,
      libraryFileName: true,
      shareModules: ['react', 'react-dom'],
      chunks: [entry]
    }))),
  ],
};
