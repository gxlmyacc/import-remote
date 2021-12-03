import React, { useState } from 'react';

const images = [
  // 'https://w.wallhaven.cc/full/95/wallhaven-95r8l8.png',
  // 'https://w.wallhaven.cc/full/lm/wallhaven-lmlgy2.png',
  // 'https://w.wallhaven.cc/full/gj/wallhaven-gj22ge.png',
  // 'https://w.wallhaven.cc/full/d5/wallhaven-d5lezl.png'
];

console.log('Slide', React, useState);

const Slides = () => {
  const [num, changeNum] = useState(0);
  const left = () => {
    if (num > 0) {
      changeNum(num - 1);
    }
  };
  const right = () => {
    if (num < 3) {
      changeNum(num + 1);
    }
  };
  const btnStyle = {
    cursor: 'pointer',
    display: 'inline-block',
    position: 'absolute',
    top: '50%',
    width: 50,
    height: 50,
    marginTop: -25,
    fontSize: '36px',
    lineHeight: '45px',
    color: 'white',
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '50%',
    textAlign: 'center',
  };
  return (
    <div style={{ position: 'relative', height: 400, margin: '0 20px', overflow: 'hidden' }}>
      <div style={{
        whiteSpace: 'nowrap',
        transition: 'transform .6s',
        transform: `translateX(-${num * 100}%)`
      }}>
        {
          images.map(url => <img key={url} src={url} width="100%" height="100%" />)
        }
      </div>
      <span style={{ ...btnStyle, left: 5, }} onClick={left}>{'<'}</span>
      <span style={{ ...btnStyle, right: 5 }} onClick={right}>{'>'}</span>
    </div>
  );
};

Slides.React = React;

export default Slides;
