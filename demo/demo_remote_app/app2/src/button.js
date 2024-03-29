import React, { useState } from 'react';
import { Button } from 'antd';

import 'antd/dist/antd.css';
import './button.less';

const RemoteButton = props => {
  console.log('RemoteButton props', props);

  const [text, setText] = useState('App 2 Button');
  return (
    <>
    <span className="font-bold">tag</span>&nbsp;
    <Button
      type="primary"

      onClick={() => {
        setText('App 2 Button Clicked!');
      }}
    >{text}</Button>
  </>
  );
};

export default RemoteButton;
