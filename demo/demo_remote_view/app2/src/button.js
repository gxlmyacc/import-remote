import React, { useState } from 'react';
import 'dpl-react/dist/dpl.css';
import { Button } from 'dpl-react';

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
