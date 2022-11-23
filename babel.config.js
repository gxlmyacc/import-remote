module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: process.env.LIBRARY_MODE ? 'commonjs' : false,
        useBuiltIns: 'usage',
        corejs: 2,
        targets: { browsers: ['Chrome >= 49', 'firefox >= 45', 'ie >= 8'] },
        loose: true
      }
    ],
  ],
  plugins: [
    '@babel/plugin-syntax-jsx',
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['@babel/plugin-syntax-dynamic-import', {}],
    ['@babel/plugin-transform-runtime', { useESModules: false, regenerator: false, }],
    'babel-plugin-define-variables',
  ]
};
