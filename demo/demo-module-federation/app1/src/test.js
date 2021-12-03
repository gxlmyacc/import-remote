import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';

import './global.css';
import 'antd/dist/antd.css';

const Slides = React.lazy(() => import('./Slides'));

const TestApp = () => (
  <div className="test-app">
    <h2 style={{ textAlign: 'center' }}>App111, Local Slides, Remote NewsList2</h2>

    <Suspense fallback={<div>Loading...</div>}>
      <Slides />
    </Suspense>
    1
  </div>
);

function renderApp(el) {
  ReactDOM.render(el, <TestApp />);
}

export {
  renderApp
};

export default TestApp;
