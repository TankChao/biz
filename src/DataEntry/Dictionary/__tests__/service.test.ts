import { queryDictionaryDemo } from '../service';
import type { DictionaryParams } from '../cache';

describe('queryDictionaryDemo', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('基本功能', () => {
    it('应该正确返回 status 字典数据', async () => {
      const params: DictionaryParams[] = [{ name: 'status' }];
      const promise = queryDictionaryDemo(params);
      jest.advanceTimersByTime(300);
      const result = await promise;

      expect(result).toHaveProperty('status');
      expect(result.status).toEqual([
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 },
      ]);
    });

    it('应该正确返回 gender 字典数据', async () => {
      const params: DictionaryParams[] = [{ name: 'gender' }];
      const promise = queryDictionaryDemo(params);
      jest.advanceTimersByTime(300);
      const result = await promise;

      expect(result).toHaveProperty('gender');
      expect(result.gender).toEqual([
        { label: '男', value: 'male' },
        { label: '女', value: 'female' },
      ]);
    });

    it('应该正确返回 type 字典数据', async () => {
      const params: DictionaryParams[] = [{ name: 'type' }];
      const promise = queryDictionaryDemo(params);
      jest.advanceTimersByTime(300);
      const result = await promise;

      expect(result).toHaveProperty('type');
      expect(result.type).toEqual([
        { label: '类型A', value: 'a' },
        { label: '类型B', value: 'b' },
        { label: '类型C', value: 'c' },
      ]);
    });
  });

  describe('批量查询', () => {
    it('应该支持同时查询多个字典', async () => {
      const params: DictionaryParams[] = [
        { name: 'status' },
        { name: 'gender' },
        { name: 'type' },
      ];
      const promise = queryDictionaryDemo(params);
      jest.advanceTimersByTime(300);
      const result = await promise;

      expect(Object.keys(result)).toHaveLength(3);
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('gender');
      expect(result).toHaveProperty('type');
      expect(result.status).toHaveLength(2);
      expect(result.gender).toHaveLength(2);
      expect(result.type).toHaveLength(3);
    });

    it('应该保持请求参数的顺序返回结果', async () => {
      const params: DictionaryParams[] = [
        { name: 'type' },
        { name: 'status' },
        { name: 'gender' },
      ];
      const promise = queryDictionaryDemo(params);
      jest.advanceTimersByTime(300);
      const result = await promise;

      const keys = Object.keys(result);
      expect(keys).toEqual(['type', 'status', 'gender']);
    });
  });

  describe('未知字典处理', () => {
    it('查询不存在的字典应该返回空数组', async () => {
      const params: DictionaryParams[] = [{ name: 'unknown' }];
      const promise = queryDictionaryDemo(params);
      jest.advanceTimersByTime(300);
      const result = await promise;

      expect(result).toHaveProperty('unknown');
      expect(result.unknown).toEqual([]);
    });

    it('混合查询已知和未知字典应该正确处理', async () => {
      const params: DictionaryParams[] = [
        { name: 'status' },
        { name: 'unknown1' },
        { name: 'gender' },
        { name: 'unknown2' },
      ];
      const promise = queryDictionaryDemo(params);
      jest.advanceTimersByTime(300);
      const result = await promise;

      expect(result.status).toHaveLength(2);
      expect(result.unknown1).toEqual([]);
      expect(result.gender).toHaveLength(2);
      expect(result.unknown2).toEqual([]);
    });
  });

  describe('空参数处理', () => {
    it('空参数列表应该返回空对象', async () => {
      const params: DictionaryParams[] = [];
      const promise = queryDictionaryDemo(params);
      jest.advanceTimersByTime(300);
      const result = await promise;

      expect(result).toEqual({});
    });
  });

  describe('异步行为', () => {
    it('应该模拟 300ms 的网络延迟', async () => {
      const params: DictionaryParams[] = [{ name: 'status' }];
      const promise = queryDictionaryDemo(params);

      let resolved = false;
      promise.then(() => { resolved = true; });

      jest.advanceTimersByTime(299);
      await Promise.resolve();
      expect(resolved).toBe(false);

      jest.advanceTimersByTime(1);
      await promise;
      expect(resolved).toBe(true);
    });
  });

  describe('返回数据结构', () => {
    it('返回的每个选项都应该包含 label 和 value 字段', async () => {
      const params: DictionaryParams[] = [
        { name: 'status' },
        { name: 'gender' },
        { name: 'type' },
      ];
      const promise = queryDictionaryDemo(params);
      jest.advanceTimersByTime(300);
      const result = await promise;

      Object.values(result).forEach((options) => {
        options.forEach((option) => {
          expect(option).toHaveProperty('label');
          expect(option).toHaveProperty('value');
          expect(typeof option.label).toBe('string');
          expect(['string', 'number']).toContain(typeof option.value);
        });
      });
    });

    it('返回结果应该是 Record 类型，键为字典名称', async () => {
      const params: DictionaryParams[] = [{ name: 'status' }];
      const promise = queryDictionaryDemo(params);
      jest.advanceTimersByTime(300);
      const result = await promise;

      expect(typeof result).toBe('object');
      expect(result).not.toBeInstanceOf(Array);
      expect(result).not.toBeNull();
    });
  });

  describe('参数扩展性', () => {
    it('应该支持带有额外参数的查询（额外参数被忽略）', async () => {
      const params: DictionaryParams[] = [
        { name: 'status', extra: 'ignored', foo: 'bar' },
      ];
      const promise = queryDictionaryDemo(params);
      jest.advanceTimersByTime(300);
      const result = await promise;

      expect(result.status).toEqual([
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 },
      ]);
    });
  });
});