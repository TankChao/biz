/** 开发环境校验：检测重复的 cache key */

const registeredKeys = new Set<string>();
const warnedKeys = new Set<string>();

export function checkDuplicateKey(key: string): void {
  if (registeredKeys.has(key)) {
    // 每个 key 只警告一次，避免循环报错
    if (warnedKeys.has(key)) return;
    warnedKeys.add(key);
    console.warn(
      `[Dictionary] 检测到重复的 cache key: "${key}"。` +
      `多个 setDictionaryConfig 使用了相同的 key，它们将共享同一个缓存实例。` +
      `如果这是预期行为可以忽略，否则请为每个 setDictionaryConfig 设置唯一的 key。`,
    );
  }
  registeredKeys.add(key);
}

/** 仅开发环境下进行校验，生产环境直接返回 false */
export function isDev(): boolean {
  return process.env.NODE_ENV === 'development';
}
