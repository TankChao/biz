import { DictionaryCache } from '../cache';
import type { DictionaryParams, DictionaryOption, DictionaryService } from '../cache';

// 模拟 service
const createMockService = (
  result: Record<string, DictionaryOption[]> = {},
  delay = 0,
): jest.Mock => {
  return jest.fn().mockImplementation(async () => {
    if (delay > 0) await new Promise((r) => setTimeout(r, delay));
    return result;
  });
};

describe('DictionaryCache', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('fetch - 批量请求', () => {
    it('应该在 flush 后返回正确调用的结果', async () => {
      const mockData: Record<string, DictionaryOption[]> = {
        status: [
          { label: '正常', value: 1 },
          { label: '禁用', value: 0 },
        ],
      };
      const service = createMockService(mockData);
      const cache = new DictionaryCache('test', service, 100);

      const promise = cache.fetch({ name: 'status' });
      jest.advanceTimersByTime(100);
      const result = await promise;

      expect(result).toEqual(mockData.status);
      expect(service).toHaveBeenCalledTimes(1);
    });

    it('应该合并同一个窗口期内的多个请求', async () => {
      const mockData: Record<string, DictionaryOption[]> = {
        status: [{ label: '正常', value: 1 }],
        gender: [{ label: '男', value: 'male' }],
      };
      const service = createMockService(mockData);
      const cache = new DictionaryCache('test', service, 100);

      const p1 = cache.fetch({ name: 'status' });
      const p2 = cache.fetch({ name: 'gender' });

      jest.advanceTimersByTime(100);
      const [r1, r2] = await Promise.all([p1, p2]);

      expect(r1).toEqual(mockData.status);
      expect(r2).toEqual(mockData.gender);
      // 批量请求只调用一次 service
      expect(service).toHaveBeenCalledTimes(1);
      expect(service).toHaveBeenCalledWith([
        { name: 'status' },
        { name: 'gender' },
      ]);
    });

    it('相同的 params 应该去重', async () => {
      const mockData: Record<string, DictionaryOption[]> = {
        status: [{ label: '正常', value: 1 }],
      };
      const service = createMockService(mockData);
      const cache = new DictionaryCache('test', service, 100);

      const p1 = cache.fetch({ name: 'status' });
      const p2 = cache.fetch({ name: 'status' });

      jest.advanceTimersByTime(100);
      const [r1, r2] = await Promise.all([p1, p2]);

      expect(r1).toEqual(r2);
      expect(service).toHaveBeenCalledTimes(1);
    });
  });

  describe('fetch - 缓存结果', () => {
    it('已缓存的 key 应直接返回，不再调用 service', async () => {
      const mockData: Record<string, DictionaryOption[]> = {
        status: [{ label: '正常', value: 1 }],
      };
      const service = createMockService(mockData);
      const cache = new DictionaryCache('test', service, 100);

      // 第一次请求
      const p1 = cache.fetch({ name: 'status' });
      jest.advanceTimersByTime(100);
      await p1;

      // 第二次请求 - 应该走缓存
      const p2 = cache.fetch({ name: 'status' });
      jest.advanceTimersByTime(100);
      const result = await p2;

      expect(result).toEqual(mockData.status);
      expect(service).toHaveBeenCalledTimes(1);
    });
  });

  describe('fetch - pending 状态', () => {
    it('并发请求中的相同 key 应该返回同一个 promise', async () => {
      const mockData: Record<string, DictionaryOption[]> = {
        status: [{ label: '正常', value: 1 }],
      };
      const service = createMockService(mockData, 50);
      const cache = new DictionaryCache('test', service, 100);

      // 触发第一个 flush
      const p1 = cache.fetch({ name: 'status' });
      await jest.advanceTimersByTimeAsync(100);

      // 在 service 还未完成时再 fetch 相同 key
      const p2 = cache.fetch({ name: 'status' });

      // 等待 service 完成 - 需要再推进 50ms 让 service 的 setTimeout 触发
      await jest.advanceTimersByTimeAsync(50);
      await Promise.all([p1, p2]);

      expect(service).toHaveBeenCalledTimes(1);
    });
  });

  describe('invalidate', () => {
    it('应该清除指定 key 的缓存', async () => {
      const mockData: Record<string, DictionaryOption[]> = {
        status: [{ label: '正常', value: 1 }],
      };
      const service = createMockService(mockData);
      const cache = new DictionaryCache('test', service, 100);

      // 第一次请求并缓存
      const p1 = cache.fetch({ name: 'status' });
      jest.advanceTimersByTime(100);
      await p1;

      // 清除缓存
      cache.invalidate({ name: 'status' });

      // 再次请求 - 应该重新调用 service
      const p2 = cache.fetch({ name: 'status' });
      jest.advanceTimersByTime(100);
      await p2;

      expect(service).toHaveBeenCalledTimes(2);
    });
  });

  describe('clear', () => {
    it('应该清除所有缓存和队列', async () => {
      const mockData: Record<string, DictionaryOption[]> = {
        status: [{ label: '正常', value: 1 }],
        gender: [{ label: '男', value: 'male' }],
      };
      const service = createMockService(mockData);
      const cache = new DictionaryCache('test', service, 100);

      const p1 = cache.fetch({ name: 'status' });
      jest.advanceTimersByTime(100);
      await p1;

      cache.clear();

      const p2 = cache.fetch({ name: 'status' });
      jest.advanceTimersByTime(100);
      await p2;

      expect(service).toHaveBeenCalledTimes(2);
    });
  });

  describe('stableKey - 参数顺序无关', () => {
    it('不同顺序的相同参数应该产生同一缓存键', async () => {
      const mockData: Record<string, DictionaryOption[]> = {
        status: [{ label: '正常', value: 1 }],
      };
      const service = createMockService(mockData);
      const cache = new DictionaryCache('test', service, 100);

      const p1 = cache.fetch({ name: 'status', extra: 'a' });
      jest.advanceTimersByTime(100);
      await p1;

      // 参数顺序不同但内容相同
      const p2 = cache.fetch({ extra: 'a', name: 'status' });
      jest.advanceTimersByTime(100);
      const result = await p2;

      expect(result).toEqual(mockData.status);
      expect(service).toHaveBeenCalledTimes(1);
    });
  });
});