import { createRequireFactory } from 'import-remote';

export default createRequireFactory({
  react: () => import(/* webpackChunkName: 'react' */ 'react'),
  'react-dom': () => import(/* webpackChunkName: 'react-dom' */ 'react-dom'),
  'prop-types': () => import(/* webpackChunkName: 'prop-types' */ 'prop-types'),
  antd: () => import(/* webpackChunkName: 'antd' */ 'antd'),
  'antd/dist/antd.css': import(/* webpackChunkName: 'antd-css' */ 'antd/dist/antd.css'),
});

// export default {
//   react: require('react'),
//   'react-dom': require('react-dom'),
//   'prop-types': require('prop-types'),
//   'antd': require('antd'),
//   'antd/dist/antd.css': require('antd/dist/antd.css'),
// }
