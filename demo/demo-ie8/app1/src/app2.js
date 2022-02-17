import { RemoteModule } from 'import-remote/src';

const app = new RemoteModule('http://localhost:3003/', {
  externals: {
    react: require('react'),
    'react-dom': require('react-dom'),
    'prop-types': require('prop-types')
  }
});

export default app;