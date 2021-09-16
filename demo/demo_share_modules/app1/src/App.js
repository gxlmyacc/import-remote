import React, { useState } from 'react';
import app2 from './app2';

const RemoteButton = React.lazy(() => app2.require('button'));

const App2 = React.lazy(() => app2.require('app'));

const App = () => {
  const [text, setText] = useState('app1 button');
  return <div>
    <h1>Import-remote 共享模块：宿主</h1>
    <h2>App1</h2>
    <br />
    &nbsp;<button
      onClick={() => {
        setText('app1 button clicked!');
      }}
    >{text}</button>&nbsp;&nbsp;&nbsp;&nbsp;
    <React.Suspense fallback="Loading Button">
      <RemoteButton />
    </React.Suspense>
    <br /><br /><hr /><br />
    <React.Suspense fallback="Loading App2">
      <App2 />
    </React.Suspense>
  </div>;
};

export default App;
