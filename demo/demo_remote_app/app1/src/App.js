import React, { useState } from 'react';
import { RemoteApp } from 'import-remote/view';
import app2 from './app2';

window.React1 = React;

const App = () => {
  const [text, setText] = useState('app1 button');
  const [showRemoteApp, setShowRemoteApp] = useState(true);
  return <div>
    <h1>Import-remote RemoteView示例：宿主</h1>
    <h2>App1</h2>
    <button
      onClick={() => {
        setText('app1 button clicked!');
      }}
    >{text}</button>
    <br /><hr /> <br />
    <RemoteApp
      module={app2}
      moduleName="button"
      props={{
        aa: 1,
        bb: 2
      }}
    />
    <br /><hr /> <br />
    <button
      onClick={() => {
        setShowRemoteApp(!showRemoteApp);
      }}
    >{ `${showRemoteApp ? 'hidden' : 'show'} RemoteApp` }</button>
    <br /><hr /> <br />

    {
      showRemoteApp
        ? <RemoteApp
          module={app2}
          moduleName="app"
          props={{
            aa: 1,
            bb: 2
          }}
        />
        : null
    }
  </div>;
};

export default App;
