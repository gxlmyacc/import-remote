import React, { useState } from 'react';
import 'antd/dist/antd.css';
import { Button } from 'antd';

const RemoteButton = props => {
  console.log('RemoteButton props', props);

  const [text, setText] = useState('App 2 Button');
  return <Button
    type="primary"
    onClick={() => {
      setText('App 2 Button Clicked!');
    }}
  >{text}</Button>;
};

export default RemoteButton;
