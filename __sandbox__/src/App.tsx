import React, { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';

import { Mokuji, type HeadingLevel } from 'mokuji.js';

type MokujiInstance = ReturnType<typeof Mokuji>;

function App() {
  const ref = useRef<HTMLDivElement>(null);
  const refMokuji = useRef<HTMLDivElement>(null);
  const mokujiInstanceRef = useRef<MokujiInstance>(undefined);

  const [minLevel, setMinLevel] = useState<HeadingLevel>(1);
  const [maxLevel, setMaxLevel] = useState<HeadingLevel>(6);
  const [includeBlockquoteHeadings, setIncludeBlockquoteHeadings] = useState(false);
  const [scrollSpy, setScrollSpy] = useState(true);
  const [scrollSpyOffset, setScrollSpyOffset] = useState(0);

  const destroyMokuji = useCallback(() => {
    mokujiInstanceRef.current?.destroy();
    mokujiInstanceRef.current = undefined;
    if (refMokuji.current) refMokuji.current.innerHTML = '';
  }, []);

  const create = useCallback(() => {
    destroyMokuji();
    if (!ref.current) return;

    const result = Mokuji(ref.current, {
      anchorType: true,
      anchorLink: true,
      anchorLinkSymbol: '#',
      anchorLinkPosition: 'before',
      anchorLinkClassName: 'anchor  anchor2  ',
      anchorContainerTagName: 'ol',
      minLevel,
      maxLevel,
      includeBlockquoteHeadings,
      scrollSpy,
      scrollSpyOffset,
    });

    if (result) {
      mokujiInstanceRef.current = result;
      refMokuji.current?.append(result.list);
    }
  }, [minLevel, maxLevel, includeBlockquoteHeadings, scrollSpy, scrollSpyOffset, destroyMokuji]);

  useEffect(() => {
    create();
    return destroyMokuji;
  }, [create, destroyMokuji]);

  const handleMinLevelChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const next = Number(e.target.value);
    setMinLevel(Math.min(next, maxLevel) as HeadingLevel);
  };

  const handleMaxLevelChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const next = Number(e.target.value);
    setMaxLevel(Math.max(next, minLevel) as HeadingLevel);
  };

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
        <div>
          <label>
            <input
              type="checkbox"
              checked={includeBlockquoteHeadings}
              onChange={(e) => setIncludeBlockquoteHeadings(e.target.checked)}
            />
            includeBlockquoteHeadings
          </label>
        </div>
        <div>
          <label>
            <input type="checkbox" checked={scrollSpy} onChange={(e) => setScrollSpy(e.target.checked)} />
            scrollSpy
          </label>
        </div>
        <div>
          <label htmlFor="scroll-spy-offset">scrollSpyOffset:</label>
          <input
            id="scroll-spy-offset"
            type="number"
            min={0}
            step={10}
            value={scrollSpyOffset}
            onChange={(e) => setScrollSpyOffset(Math.max(0, Number(e.target.value) || 0))}
            disabled={!scrollSpy}
          />
        </div>
      </div>
      <button type="button" onClick={create}>
        Create
      </button>
      <button type="button" onClick={destroyMokuji}>
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

            <h2 id="test">has duplicate id → test</h2>
            <h2>test</h2>

            <h2>aaa</h2>
            <h2>aaa</h2>
            <h2>aaa</h2>
            <h2>aaa_2</h2>
            <h3>aaa</h3>

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

            <h2>blockquote テスト</h2>
            <blockquote>
              <h3>引用内の見出し</h3>
              <p>この見出しはデフォルトでは目次に含まれない</p>
              <blockquote>
                <h4>ネストされた引用内の見出し</h4>
              </blockquote>
            </blockquote>

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
