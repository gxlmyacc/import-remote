module.exports = api => {
  api && api.cache && api.cache(true);
  return ({
    presets: [
      [
        '@babel/preset-env',
        {
          useBuiltIns: 'usage',
          corejs: 2,
          targets: { browsers: ['IE >= 8'] }
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
