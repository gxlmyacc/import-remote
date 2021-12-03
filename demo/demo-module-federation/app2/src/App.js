import React from 'react';
import NewsList from './NewsList';

const RemoteSlides = React.lazy(() => import('app1/Slides'));

const App = () => (
  <div>
    <h2 style={{ textAlign: 'center' }}>App 2, Remote Slides, Local NewsList</h2>
    <React.Suspense fallback="Loading Slides">
      <RemoteSlides />
    </React.Suspense>
    <NewsList />
  </div>
);

export default App;
