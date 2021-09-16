import React, { useState } from 'react';
import 'dpl-react/dist/dpl.css';
import { Button } from 'dpl-react';

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
