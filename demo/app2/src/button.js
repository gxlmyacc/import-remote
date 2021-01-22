import React, { useState } from 'react';

const Button = () => {
  const [text, setText] = useState('App 2 Button');
  return <button
    onClick={() => {
      setText('App 2 Button Clicked!');
    }}
  >{text}</button>;
};

export default Button;
