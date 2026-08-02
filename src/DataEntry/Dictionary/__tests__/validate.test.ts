import { checkDuplicateKey, isDev } from '../validate';

describe('Dictionary validate', () => {
  describe('isDev', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('NODE_ENV 为 development 时返回 true', () => {
      process.env.NODE_ENV = 'development';
      expect(isDev()).toBe(true);
    });

    it('NODE_ENV 为 production 时返回 false', () => {
      process.env.NODE_ENV = 'production';
      expect(isDev()).toBe(false);
    });

    it('NODE_ENV 为 test 时返回 false', () => {
      process.env.NODE_ENV = 'test';
      expect(isDev()).toBe(false);
    });
  });

  describe('checkDuplicateKey', () => {
    let warnSpy: jest.SpyInstance;

    beforeEach(() => {
      warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      warnSpy.mockRestore();
    });

    it('首次注册的 key 不应触发警告', () => {
      // 使用唯一的 key 避免其他测试干扰
      const uniqueKey = `unique-key-${Date.now()}-${Math.random()}`;
      checkDuplicateKey(uniqueKey);
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('重复注册相同的 key 应触发警告', () => {
      const duplicateKey = `dup-key-${Date.now()}-${Math.random()}`;
      checkDuplicateKey(duplicateKey);
      checkDuplicateKey(duplicateKey);
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining(duplicateKey),
      );
    });
  });
});
