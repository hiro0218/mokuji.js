// eslint-disable-next-line unicorn/filename-case
import React, { useCallback, useEffect } from 'react';

import { Mokuji, Destroy } from 'mokuji.js';

function App() {
  const create = useCallback(() => {
    const mokuji = Mokuji(document.querySelector('#target'), {
      anchorType: true,
      anchorLink: true,
      anchorLinkSymbol: '#',
      anchorLinkPosition: 'before',
      anchorLinkClassName: 'anchor  anchor2  ',
      anchorContainerTagName: 'ol',
    });

    if (mokuji) {
      const list = document.querySelector('#mokuji');
      list?.append(mokuji);
    }
  }, []);

  useEffect(() => {
    create();

    return () => {
      Destroy();
    };
  }, []);

  return (
    <main className="container">
      <button type="button" onClick={() => create()}>
        Create
      </button>
      <button type="button" onClick={() => Destroy()}>
        Destroy
      </button>
      <div className="grid">
        <div>
          <h2 className="heading">目次</h2>
          <div id="mokuji"></div>
        </div>
        <div>
          <h2 className="heading">本文</h2>
          <div id="target">
            <h1>one</h1>

            <h2>two</h2>
            <h3>three - one</h3>
            <h3>three - two</h3>

            <h2>two</h2>
            <h3>three</h3>

            <h2>two</h2>
            <h4>four</h4>
            <h3>A&amp;B</h3>

            <h2 id="dup">duplicate id</h2>
            <h2 id="dup">duplicate id</h2>

            <h2>aaa</h2>
            <h2>aaa</h2>
            <h2>aaa_2</h2>

            <h2>two</h2>
            <h5>five</h5>
            <h6>six</h6>

            <hr />

            <h2>重複</h2>
            <h3>重複</h3>
            <h4>重複</h4>

            <hr />

            <h2>😌</h2>

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
    </main>
  );
}

export default App;
