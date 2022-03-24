import React, { useEffect } from 'react';

import { Mokuji } from 'mokuji.js';

import './App.css';

function App() {
  useEffect(() => {
    const mokuji = new Mokuji(document.getElementById('target'), {
      anchorType: true,
      anchorLink: true,
      anchorLinkSymbol: '#',
      anchorLinkBefore: true,
      anchorLinkClassName: 'anchor',
    });

    const list = document.getElementById('mokuji');
    list?.appendChild(mokuji);
  }, []);

  return (
    <>
      <div className="container">
        <div className="columns">
          <div className="column">
            <div className="heading">目次</div>
            <div id="mokuji"></div>
          </div>
          <div id="target" className="column">
            <div className="heading">本文</div>

            <h1>one</h1>

            <h2>two</h2>
            <h3>three - one</h3>
            <h3>three - two</h3>

            <h2>two</h2>
            <h3>three</h3>

            <h2>two</h2>
            <h4>four</h4>

            <h3>A&amp;B</h3>

            <h2>two</h2>
            <h5>five</h5>
            <h6>six</h6>

            <hr />

            <h2>重複</h2>
            <h3>重複</h3>
            <h4>重複</h4>

            <hr />

            <h2>弐</h2>
            <h2>2</h2>
            <h3>参</h3>
            <h3>3</h3>
            <h4>肆</h4>
            <h4>4</h4>
            <h5>伍</h5>
            <h5>5</h5>
            <h6>陸</h6>
            <h6>6</h6>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
