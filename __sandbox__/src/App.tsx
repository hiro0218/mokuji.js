import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';

import {
  createMokuji,
  ResultUtils,
  destroyMokuji,
  type HeadingLevel,
  type MokujiConfig,
  type MokujiResult,
} from 'mokuji.js';

// カスタムフック：目次生成の状態管理
function useMokuji(elementRef: React.RefObject<HTMLDivElement | null>, config: Partial<MokujiConfig>) {
  const [toc, setToc] = useState<MokujiResult>();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const tocElementRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);

  // 設定の文字列化による依存関係の管理（深い比較の代替）
  const configKey = useMemo(() => JSON.stringify(config), [config]);

  // 目次生成関数（configKeyのみに依存）
  const generateToc = useCallback(() => {
    if (!elementRef.current) {
      return;
    }

    setLoading(true);
    setError('');

    // 既存のDOMをクリア
    destroyMokuji();

    const result = createMokuji(elementRef.current, config);

    if (ResultUtils.isOk(result)) {
      setToc(result.data);
      setError('');
    } else if (ResultUtils.isError(result)) {
      setError(result.error.message);
      setToc(undefined);
    }

    setLoading(false);
  }, [elementRef, configKey, config]);

  // 初期化と設定変更時の処理
  useEffect(() => {
    if (isInitializedRef.current === false) {
      isInitializedRef.current = true;
      generateToc();
    } else {
      // 設定変更時は少し遅延を入れる
      const timeoutId = setTimeout(() => {
        generateToc();
      }, 300);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [generateToc]);

  // コンポーネントのアンマウント時にクリーンアップ
  useEffect(() => {
    return () => {
      destroyMokuji();
    };
  }, []);

  // 目次をDOMに挿入（tocが変更された時のみ）
  useEffect(() => {
    if (toc && tocElementRef.current) {
      // Reactが管理するDOM要素をクリア
      tocElementRef.current.innerHTML = '';

      // 新しい目次要素を挿入
      tocElementRef.current.append(toc.listElement);
    }
  }, [toc]);

  // 手動クリーンアップ用の関数
  const clearToc = useCallback(() => {
    destroyMokuji();

    setToc(undefined);
    setError('');
    if (tocElementRef.current) {
      tocElementRef.current.innerHTML = '';
    }
  }, []);

  // 手動再生成用の関数
  const regenerateToc = useCallback(() => {
    generateToc();
  }, [generateToc]);

  return { toc, error, loading, tocElementRef, regenerate: regenerateToc, clear: clearToc };
}

function App() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [minLevel, setMinLevel] = useState<HeadingLevel>(1);
  const [maxLevel, setMaxLevel] = useState<HeadingLevel>(6);

  // 目次設定 - useMemoで参照の安定性を確保
  const mokujiConfig = useMemo<Partial<MokujiConfig>>(
    () => ({
      anchorType: true,
      anchorLink: true,
      anchorLinkSymbol: '#',
      anchorLinkPosition: 'before' as const,
      anchorLinkClassName: 'anchor anchor2',
      containerTagName: 'ol' as const,
      minLevel,
      maxLevel,
    }),
    [minLevel, maxLevel],
  );

  const { error, loading, tocElementRef, regenerate, clear } = useMokuji(contentRef, mokujiConfig);

  // レベル変更処理
  const handleMinLevelChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newMinLevel = Number(e.target.value) as HeadingLevel;
      // 最小レベルが最大レベルを超えないようにする
      setMinLevel(Math.min(newMinLevel, maxLevel) as HeadingLevel);
    },
    [maxLevel],
  );

  const handleMaxLevelChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newMaxLevel = Number(e.target.value) as HeadingLevel;
      // 最大レベルが最小レベル未満にならないようにする
      setMaxLevel(Math.max(newMaxLevel, minLevel) as HeadingLevel);
    },
    [minLevel],
  );

  return (
    <main className="container">
      <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1>mokuji.js Demo</h1>
        <p>Interactive demonstration of the table of contents generator library</p>
        <p>Using the new functional API with modern React patterns</p>
      </header>

      <div className="controls">
        <div className="control-group">
          <label htmlFor="min-level">Min Level:</label>
          <select id="min-level" value={minLevel} onChange={handleMinLevelChange}>
            {[1, 2, 3, 4, 5, 6].map((level) => (
              <option key={`min-${level}`} value={level}>
                h{level}
              </option>
            ))}
          </select>
        </div>
        <div className="control-group">
          <label htmlFor="max-level">Max Level:</label>
          <select id="max-level" value={maxLevel} onChange={handleMaxLevelChange}>
            {[1, 2, 3, 4, 5, 6].map((level) => (
              <option key={`max-${level}`} value={level}>
                h{level}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="actions">
        <button type="button" onClick={regenerate} disabled={loading}>
          {loading ? 'Generating...' : 'Regenerate TOC'}
        </button>
        <button type="button" onClick={clear}>
          Clear All
        </button>
      </div>

      {error && (
        <div className="error">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="grid">
        <div>
          <h2 className="heading">目次 (Table of Contents)</h2>
          {loading ? <div>目次を生成中...</div> : <div id="mokuji" ref={tocElementRef}></div>}
        </div>
        <div>
          <h2 className="heading">本文 (Content)</h2>
          <div id="target" ref={contentRef}>
            <h1>はじめに (Introduction)</h1>

            <h2>基本概念 (Basic Concepts)</h2>
            <h3>見出しの階層 (Heading Hierarchy)</h3>
            <h3>アンカーリンク (Anchor Links)</h3>

            <h2>設定オプション (Configuration Options)</h2>
            <h3>レベル設定 (Level Settings)</h3>

            <h2>使用例 (Usage Examples)</h2>
            <h4>基本的な使用法 (Basic Usage)</h4>
            <h3>高度な設定 (Advanced Configuration)</h3>

            <h2 id="dup">重複ID (Duplicate ID)</h2>
            <h2 id="dup">重複ID (Duplicate ID)</h2>

            <h2>同名見出し (Same Name Headings)</h2>
            <h2>同名見出し (Same Name Headings)</h2>
            <h2>同名見出し_2</h2>

            <h2>特殊文字のテスト (Special Characters Test)</h2>
            <h5>深いレベル (Deep Level)</h5>
            <h6>最深レベル (Deepest Level)</h6>

            <hr />

            <h2>多言語サポート (Multi-language Support)</h2>
            <h3>日本語 (Japanese)</h3>
            <h4>ひらがな・カタカナ</h4>

            <hr />

            <h2>絵文字テスト 😌</h2>

            <hr />

            <h2>数字と漢数字 (Numbers and Kanji Numbers)</h2>
            <h2>壱 (One)</h2>
            <h2>1</h2>
            <h3>弐 (Two)</h3>
            <h3>2</h3>
            <h4>参 (Three)</h4>
            <h4>3</h4>
            <h5>肆 (Four)</h5>
            <h5>4</h5>
            <h6>伍 (Five)</h6>
            <h6>5</h6>
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
