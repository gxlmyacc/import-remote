import React from 'react';
import Slides from './Slides';

const RemoteNewsList = React.lazy(() => {
  const ret = import('app2/NewsList');
  console.log('ret', ret);
  return ret;
});

const App = () => (
  <div>
    <h2 style={{ textAlign: 'center' }}>App113, Local Slides, Remote NewsList</h2>
    <Slides />
    <React.Suspense fallback="Loading Slides">
      <RemoteNewsList />
    </React.Suspense>
  </div>
);

export default App;
