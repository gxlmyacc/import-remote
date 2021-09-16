import React, { useState } from 'react';
import 'antd/dist/antd.css';
import { Button } from 'antd';

window.abc = 111;

const RemoteButton = () => {
  const [text, setText] = useState('App 2 Button');
  return <Button
    type="primary"
    onClick={() => {
      window.abc++;
      setText('App 2 Button Clicked! ' + window.abc);
    }}
  >{text}{window.abc}</Button>;
};

export default RemoteButton;
