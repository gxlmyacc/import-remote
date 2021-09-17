module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: 'commonjs',
        useBuiltIns: 'usage',
        corejs: 2,
        targets: { browsers: ['Chrome >= 31'] }
      }
    ],
  ],
  plugins: [
    "@babel/plugin-transform-arrow-functions", '@babel/plugin-transform-destructuring'
  ]
};
