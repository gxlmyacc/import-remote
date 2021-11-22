import React, { useState } from 'react';
import { Button } from 'antd';

import './button.css';
import 'antd/dist/antd.css';

const RemoteButton = props => {
  console.log('RemoteButton props', props);

  const [text, setText] = useState('App 2 Button');
  return (
    <>
    <span className="font-bold">标签</span>&nbsp;
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
