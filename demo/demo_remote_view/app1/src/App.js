import React, { useState } from 'react';
import RemoteView from 'import-remote/view';
import app2 from './app2';

const App = () => {
  const [text, setText] = useState('app1 button');
  const [showRemoteView, setShowRemoteView] = useState(true);
  return <div>
    <h1>Import-remote RemoteView示例：宿主</h1>
    <h2>App1</h2>
    <button
      onClick={() => {
        setText('app1 button clicked!');
      }}
    >{text}</button>
    <br /><hr /> <br />
    <RemoteView
      // shadow
      scopeStyle
      module={app2}
      moduleName="button"
      // transfromHtmlBodyTagClass={false}
      style={{ height: 'initial' }}
      bodyStyle={{ height: 'initial' }}
      props={{
        aa: 1,
        bb: 2
      }}
    />
    <br /><hr /> <br />
    <button
      onClick={() => {
        setShowRemoteView(!showRemoteView);
      }}
    >{ `${showRemoteView ? '隐藏' : '显示'}RemoteView` }</button>
    <br /><hr /> <br />

    {
      showRemoteView
        ? <RemoteView
          // shadow
          scopeStyle
          module={app2}
          moduleName="app"
          // transfromHtmlBodyTagClass={false}
          style={{ height: 'inheirt' }}
          bodyStyle={{ height: 'inheirt' }}
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
