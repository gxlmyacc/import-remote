import React, { useState } from 'react';
import app2 from './app2';

const RemoteButton = React.lazy(async () => {
  const ret = await app2.require('button');
  console.log('app2 button loaded', ret)
  return ret;
});

const App2 = React.lazy(async () => {
  const ret = await app2.require('app');
  console.log('app2 app loaded', ret)
  return ret;
});

const App = () => {
  const [text, setText] = useState('app1 button');
  return <div>
    <h1>Import-remote 公共模块示例：宿主</h1>
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
