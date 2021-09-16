import { createRequireFactory } from 'import-remote';

export default createRequireFactory({
  react: () => import(/* webpackChunkName: 'react' */ 'react'),
  'react-dom': () => import(/* webpackChunkName: 'react-dom' */ 'react-dom'),
  'prop-types': () => import(/* webpackChunkName: 'prop-types' */ 'prop-types'),
  'dpl-react': () => import(/* webpackChunkName: 'dpl-react' */ 'dpl-react'),
  'dpl-react/dist/dpl.css': import(/* webpackChunkName: 'dpl-react-css' */ 'dpl-react/dist/dpl.css'),
});

// export default {
//   react: require('react'),
//   'react-dom': require('react-dom'),
//   'prop-types': require('prop-types'),
//   'dpl-react': require('dpl-react'),
// }