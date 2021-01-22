import React, { useState } from 'react';
import app2 from './app2';

const RemoteButton = React.lazy(async () => {
  const ret = await app2.require('button');
  console.log('app1 app2/button', ret);
  return ret;
});

const App2 = React.lazy(async () => {
  const ret = await app2.require('app');
  console.log('app1 app2/app', ret);
  return ret;
});

const App = () => {
  const [text, setText] = useState('app1 button');
  return <div>
    <h1>Basic Host-Remote</h1>
    <h2>App 123</h2>
    <button
      onClick={() => {
        setText('app1 button clicked!');
      }}
    >{text}</button>
    <React.Suspense fallback="Loading Button">
      <RemoteButton />
    </React.Suspense>
    <React.Suspense fallback="Loading App2">
      <App2 />
    </React.Suspense>
  </div>;
};

export default App;
