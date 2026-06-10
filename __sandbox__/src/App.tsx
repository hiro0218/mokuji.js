import React, { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';

import { Mokuji, type HeadingLevel } from 'mokuji.js';

type MokujiInstance = ReturnType<typeof Mokuji>;

const HEADING_LEVELS = [1, 2, 3, 4, 5, 6] as const satisfies ReadonlyArray<HeadingLevel>;

const ACTIVE_ATTRIBUTE = 'data-mokuji-active';

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
      anchorLinkClassName: 'heading-anchor',
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

  useEffect(() => {
    const container = refMokuji.current;
    if (!container) return;

    const observer = new MutationObserver((mutations) => {
      for (const { target } of mutations) {
        if (!(target instanceof HTMLElement) || !target.hasAttribute(ACTIVE_ATTRIBUTE)) continue;

        const containerRect = container.getBoundingClientRect();
        const linkRect = target.getBoundingClientRect();
        if (linkRect.top < containerRect.top || linkRect.bottom > containerRect.bottom) {
          const centerDelta = linkRect.top - containerRect.top - (containerRect.height - linkRect.height) / 2;
          container.scrollTop += centerDelta;
        }
        return;
      }
    });
    observer.observe(container, { subtree: true, attributes: true, attributeFilter: [ACTIVE_ATTRIBUTE] });
    return () => observer.disconnect();
  }, []);

  const handleMinLevelChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const next = Number(e.target.value);
    setMinLevel(Math.min(next, maxLevel) as HeadingLevel);
  };

  const handleMaxLevelChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const next = Number(e.target.value);
    setMaxLevel(Math.max(next, minLevel) as HeadingLevel);
  };

  return (
    <div className="app">
      <header className="site-header">
        <span className="brand">mokuji.js</span>
        <nav className="site-nav">
          <a href="https://github.com/hiro0218/mokuji.js" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </nav>
      </header>

      <div className="layout">
        <aside className="pane">
          <section className="pane-group" aria-labelledby="options-label">
            <h2 className="pane-label" id="options-label">
              Options
            </h2>
            <div className="field-grid">
              <div className="field">
                <label htmlFor="min-level">minLevel</label>
                <select id="min-level" value={minLevel} onChange={handleMinLevelChange}>
                  {HEADING_LEVELS.map((level) => (
                    <option key={`min-${level}`} value={level}>
                      h{level}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="max-level">maxLevel</label>
                <select id="max-level" value={maxLevel} onChange={handleMaxLevelChange}>
                  {HEADING_LEVELS.map((level) => (
                    <option key={`max-${level}`} value={level}>
                      h{level}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="checks">
              <label className="check">
                <input
                  type="checkbox"
                  checked={includeBlockquoteHeadings}
                  onChange={(e) => setIncludeBlockquoteHeadings(e.target.checked)}
                />
                <span>includeBlockquoteHeadings</span>
              </label>
              <label className="check">
                <input type="checkbox" checked={scrollSpy} onChange={(e) => setScrollSpy(e.target.checked)} />
                <span>scrollSpy</span>
              </label>
            </div>
            <div className="field">
              <label htmlFor="scroll-spy-offset">scrollSpyOffset</label>
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
            <div className="actions">
              <button type="button" className="btn btn-primary" onClick={create}>
                Create
              </button>
              <button type="button" className="btn" onClick={destroyMokuji}>
                Destroy
              </button>
            </div>
          </section>

          <nav className="pane-group pane-toc" aria-labelledby="toc-label">
            <h2 className="pane-label" id="toc-label">
              Table of Contents
            </h2>
            <div id="mokuji" ref={refMokuji}></div>
          </nav>
        </aside>

        <article className="content" id="target" ref={ref}>
          <h1>one</h1>
          <p>
            このページ自体がデモです。左の目次は、この本文に含まれる見出しから生成されています。項目を押すと該当の見出しへ移動し、スクロールに応じて現在地がハイライトされます。
          </p>

          <h2>two</h2>
          <p>h1 から h6 までの見出し階層は、そのまま目次の入れ子構造になります。</p>
          <h3>three - one</h3>
          <p>同じ深さに並んだ見出しは、目次でも同じ深さの項目として列挙されます。</p>
          <h3>three - two</h3>
          <p>
            見出しのテキストからアンカー (<code>id</code>) が生成され、リンクとして機能します。
          </p>

          <h2>two</h2>
          <p>先ほどと同じ「two」というテキストですが、アンカーは重複しないよう自動で連番が付きます。</p>
          <h3>three</h3>
          <p>
            階層が深い見出しも、<code>minLevel</code> / <code>maxLevel</code> の範囲内であれば目次に含まれます。
          </p>

          <h2>two</h2>
          <h4>four</h4>
          <p>h3 を飛ばして h4 が現れるケースです。途中の階層が欠けていても目次は破綻しません。</p>
          <h3>A&amp;B</h3>
          <p>記号を含む見出しも正しくエンコードされ、アンカーとして機能します。</p>

          <h2 id="dup">duplicate id</h2>
          <p>
            この見出しと次の見出しは、どちらも <code>id=&quot;dup&quot;</code> を持っています。
          </p>
          <h2 id="dup">duplicate id</h2>
          <p>重複した id は自動的に一意化され、目次からそれぞれ正しく参照できます。</p>

          <h2 id="test">has duplicate id → test</h2>
          <p>
            この見出しは元から <code>id=&quot;test&quot;</code> を持っています。
          </p>
          <h2>test</h2>
          <p>テキストから生成されるアンカーが既存の id と衝突する場合も、一意な id へ解決されます。</p>

          <h2>aaa</h2>
          <h2>aaa</h2>
          <h2>aaa</h2>
          <p>
            同名の見出しが連続すると、2 つ目以降には <code>_2</code>、<code>_3</code> のような接尾辞が付きます。
          </p>
          <h2>aaa_2</h2>
          <p>接尾辞付きと同じテキストの見出しが既にあっても、衝突しないよう調整されます。</p>
          <h3>aaa</h3>
          <p>階層が違っても、同名見出しには同じ重複解決のルールが適用されます。</p>

          <h2>two</h2>
          <h5>five</h5>
          <h6>six</h6>
          <p>
            h5 ・ h6 のような深い見出しの拾われ方は、<code>minLevel</code> / <code>maxLevel</code>{' '}
            の設定で確認できます。
          </p>

          <hr />

          <h2>重複</h2>
          <h3>重複</h3>
          <h4>重複</h4>
          <p>
            日本語の見出しは <code>anchorType: true</code> (Wikipedia 方式)
            のとき、ドット区切りの形式にエンコードされます。リンク先の URL で確認できます。
          </p>

          <hr />

          <h2>😌</h2>
          <p>絵文字だけの見出しも、そのままアンカーになります。</p>

          <hr />

          <h2>blockquote テスト</h2>
          <p>
            引用ブロック内の見出しは、既定では目次に含まれません。<code>includeBlockquoteHeadings</code> を有効にして
            Create し直すと現れます。
          </p>
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
          <p>漢数字とアラビア数字が混在しても、それぞれ独立した項目として扱われます。本文はここまでです。</p>
        </article>
      </div>
    </div>
  );
}

export default App;
