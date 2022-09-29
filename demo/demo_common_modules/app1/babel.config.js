module.exports = api => {
  api && api.cache && api.cache(true);
  return ({
    presets: [
      [
        '@babel/preset-env',
        {
          useBuiltIns: 'usage',
          corejs: 2,
          targets: { browsers: ['Chrome >= 78'] }
        }
      ],
      [
        '@babel/preset-react',
        {
          development: process.env.NODE_ENV !== 'production',
        }
      ]
    ],
    plugins: [
    ]
  });
};
