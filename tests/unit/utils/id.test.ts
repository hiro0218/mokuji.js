/**
 * ID生成ユーティリティのテスト
 */
import { describe, it, expect } from 'vitest';
import { generateUniqueId, createIdTracker } from '../../../src/utils/id';

describe('ID生成ユーティリティ', () => {
  describe('generateUniqueId', () => {
    it('使用されていないIDをそのまま返すこと', () => {
      const usedIds = new Set<string>();
      const id = generateUniqueId('test', usedIds);
      expect(id).toBe('test');
    });

    it('すでに使用されているIDには連番を付加すること', () => {
      const usedIds = new Set<string>(['test']);
      const id = generateUniqueId('test', usedIds);
      expect(id).toBe('test_1');
    });

    it('複数回衝突した場合、連番を適切に増加させること', () => {
      const usedIds = new Set<string>(['test', 'test_1', 'test_2']);
      const id = generateUniqueId('test', usedIds);
      expect(id).toBe('test_3');
    });

    it('生成したIDがusedIdsに追加されること', () => {
      const usedIds = new Set<string>();
      generateUniqueId('test', usedIds);
      expect(usedIds.has('test')).toBe(true);
    });
  });

  describe('createIdTracker', () => {
    it('一意のIDを生成するオブジェクトを返すこと', () => {
      const tracker = createIdTracker();

      expect(tracker).toHaveProperty('generateUniqueId');
      expect(tracker).toHaveProperty('hasId');
      expect(tracker).toHaveProperty('clear');
      expect(tracker).toHaveProperty('getUsedIds');
    });

    it('generateUniqueIdで一意のIDを生成すること', () => {
      const tracker = createIdTracker();
      const id1 = tracker.generateUniqueId('test');
      const id2 = tracker.generateUniqueId('test');

      expect(id1).toBe('test');
      expect(id2).toBe('test_1');
    });

    it('hasIdでIDの使用状況を確認できること', () => {
      const tracker = createIdTracker();
      tracker.generateUniqueId('test');

      expect(tracker.hasId('test')).toBe(true);
      expect(tracker.hasId('nonexistent')).toBe(false);
    });

    it('clearで使用済みIDをリセットすること', () => {
      const tracker = createIdTracker();
      tracker.generateUniqueId('test');
      tracker.clear();

      expect(tracker.hasId('test')).toBe(false);
      expect(tracker.generateUniqueId('test')).toBe('test');
    });

    it('getUsedIdsで使用済みIDのコピーを返すこと', () => {
      const tracker = createIdTracker();
      tracker.generateUniqueId('test1');
      tracker.generateUniqueId('test2');

      const usedIds = tracker.getUsedIds();
      expect(usedIds).toBeInstanceOf(Set);
      expect(usedIds.has('test1')).toBe(true);
      expect(usedIds.has('test2')).toBe(true);

      // 返されたセットは元のセットとは異なるインスタンスであることを確認
      usedIds.add('test3');
      expect(tracker.hasId('test3')).toBe(false);
    });
  });
});
