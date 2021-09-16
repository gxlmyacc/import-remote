import React, { useState } from 'react';
import { Button } from 'dpl-react';

const RemoteButton = () => {
  const [text, setText] = useState('App 2 Button');
  return <Button
    type="primary"
    onClick={() => {
      setText('App 2 Button Clicked!');
    }}
  >{text}</Button>;
};

export default RemoteButton;
