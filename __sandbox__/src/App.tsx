import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Mokuji, type HeadingLevel } from 'mokuji.js';

function App() {
  const ref = useRef<HTMLDivElement>(null);
  const refMokuji = useRef<HTMLDivElement>(null);
  const [minLevel, setMinLevel] = useState<HeadingLevel>(1);
  const [maxLevel, setMaxLevel] = useState<HeadingLevel>(6);
  const mokujiInstanceRef = useRef<ReturnType<typeof Mokuji> | null>(null);

  // オプションを関数外で参照できるようにする
  const mokujiOptionsRef = useRef({
    minLevel,
    maxLevel,
  });

  // オプションの変更を反映
  useEffect(() => {
    mokujiOptionsRef.current = {
      minLevel,
      maxLevel,
    };
  }, [minLevel, maxLevel]);

  // create関数の依存配列から状態変数を除去
  const create = useCallback(() => {
    // 既存のインスタンスがあれば破棄
    if (mokujiInstanceRef.current) {
      mokujiInstanceRef.current.destroy();
      mokujiInstanceRef.current = null;
    }

    // 現在の設定値を参照
    const { minLevel, maxLevel } = mokujiOptionsRef.current;

    if (!ref.current) {
      return;
    }

    const result = Mokuji(ref.current, {
      anchorType: true,
      anchorLink: true,
      anchorLinkSymbol: '#',
      anchorLinkPosition: 'before',
      anchorLinkClassName: 'anchor  anchor2  ',
      anchorContainerTagName: 'ol',
      minLevel,
      maxLevel,
    });

    if (result) {
      mokujiInstanceRef.current = result;
      if (refMokuji.current) {
        refMokuji.current.innerHTML = ''; // 既存コンテンツをクリア
        refMokuji.current.append(result.list);
      }
      if (ref.current && result.element) {
        ref.current.innerHTML = result.element.innerHTML;
      }
    }
  }, []);

  useEffect(() => {
    create();

    return () => {
      if (mokujiInstanceRef.current) {
        mokujiInstanceRef.current.destroy();
        mokujiInstanceRef.current = null;
      }
    };
  }, []);

  // レベル変更時の処理を共通化
  const handleLevelChange = useCallback(() => {
    // 目次を再生成する
    create();
  }, [create]);

  const handleMinLevelChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newMinLevel = Number(e.target.value);
      // 最小レベルが最大レベルを超えないようにする
      setMinLevel(Math.min(newMinLevel, maxLevel) as HeadingLevel);
      // 直ちにhandleLevelChangeを呼び出さない（setStateの後に実行される）
    },
    [maxLevel],
  );

  const handleMaxLevelChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newMaxLevel = Number(e.target.value);
      // 最大レベルが最小レベル未満にならないようにする
      setMaxLevel(Math.max(newMaxLevel, minLevel) as HeadingLevel);
      // 直ちにhandleLevelChangeを呼び出さない（setStateの後に実行される）
    },
    [minLevel],
  );

  // レベル変更時に目次を更新
  useEffect(() => {
    handleLevelChange();
  }, [minLevel, maxLevel, handleLevelChange]);

  return (
    <main className="container">
      <div>
        <div>
          <label htmlFor="min-level">min level:</label>
          <select id="min-level" value={minLevel} onChange={handleMinLevelChange}>
            {[1, 2, 3, 4, 5, 6].map((level) => (
              <option key={`min-${level}`} value={level}>
                h{level}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="max-level">max level:</label>
          <select id="max-level" value={maxLevel} onChange={handleMaxLevelChange}>
            {[1, 2, 3, 4, 5, 6].map((level) => (
              <option key={`max-${level}`} value={level}>
                h{level}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button type="button" onClick={() => create()}>
        Create
      </button>
      <button
        type="button"
        onClick={() => {
          if (mokujiInstanceRef.current) {
            mokujiInstanceRef.current.destroy();
            mokujiInstanceRef.current = null;
            if (refMokuji.current) {
              refMokuji.current.innerHTML = '';
            }
          }
        }}
      >
        Destroy
      </button>
      <div className="grid">
        <div>
          <h2 className="heading">目次</h2>
          <div id="mokuji" ref={refMokuji}></div>
        </div>
        <div>
          <h2 className="heading">本文</h2>
          <div id="target" ref={ref}>
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
