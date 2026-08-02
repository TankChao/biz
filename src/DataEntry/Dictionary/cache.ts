/**
 * 字典请求缓存 & 批量合并模块
 */
export interface DictionaryParams { name: string; [key: string]: any; }
export interface DictionaryOption { label: string; value: string | number; [key: string]: any; }
export type DictionaryService = (paramsList: DictionaryParams[]) => Promise<Record<string, DictionaryOption[]>>;

function stableKey(params: DictionaryParams): string {
  const sorted: Record<string, any> = {};
  Object.keys(params).sort().forEach((k) => { sorted[k] = params[k]; });
  return JSON.stringify(sorted);
}

interface Deferred { resolve: (value: DictionaryOption[]) => void; reject: (reason: any) => void; }
interface QueueEntry { params: DictionaryParams; resolvers: Deferred[]; }

export interface DictionaryConfig {
  /** 缓存标识，同一 key 的组件共享缓存 */
  key: string;
  /** 批量字典查询接口 */
  service: DictionaryService;
  /** 请求合并窗口毫秒数 */
  time: number;
}

export class DictionaryCache {
  readonly key: string;
  private cache = new Map<string, DictionaryOption[]>();
  private pending = new Map<string, Promise<DictionaryOption[]>>();
  private queue = new Map<string, QueueEntry>();
  private timer: ReturnType<typeof setTimeout> | null = null;
  private service: DictionaryService;
  private time: number;

  constructor(key: string, service: DictionaryService, time: number) {
    this.key = key;
    this.service = service;
    this.time = time;
  }

  fetch(params: DictionaryParams): Promise<DictionaryOption[]> {
    const k = stableKey(params);
    if (this.cache.has(k)) return Promise.resolve(this.cache.get(k)!);
    if (this.pending.has(k)) return this.pending.get(k)!;

    return new Promise<DictionaryOption[]>((resolve, reject) => {
      const entry = this.queue.get(k);
      if (entry) {
        entry.resolvers.push({ resolve, reject });
      } else {
        this.queue.set(k, { params, resolvers: [{ resolve, reject }] });
      }
      this.scheduleFlush();
    });
  }

  invalidate(params: DictionaryParams): void {
    const k = stableKey(params);
    this.cache.delete(k);
    this.pending.delete(k);
  }

  clear(): void {
    this.cache.clear();
    this.pending.clear();
    this.queue.clear();
  }

  private scheduleFlush(): void {
    if (this.timer) return;
    this.timer = setTimeout(() => { this.timer = null; this.flush(); }, this.time);
  }

  private async flush(): Promise<void> {
    if (this.queue.size === 0) return;
    const batch = new Map(this.queue);
    this.queue.clear();

    const uniqueParams: DictionaryParams[] = [];
    const keysToFetch: string[] = [];

    for (const [key, entry] of batch) {
      if (this.cache.has(key)) {
        const cached = this.cache.get(key)!;
        for (const d of entry.resolvers) d.resolve(cached);
        continue;
      }
      if (this.pending.has(key)) {
        this.pending.get(key)!.then(
          (data) => { for (const d of entry.resolvers) d.resolve(data); },
          (err) => { for (const d of entry.resolvers) d.reject(err); },
        );
        continue;
      }
      uniqueParams.push(entry.params);
      keysToFetch.push(key);
    }

    if (uniqueParams.length === 0) return;

    const batchPromise = this.service(uniqueParams);
    for (const k of keysToFetch) {
      const entry = batch.get(k)!;
      this.pending.set(k, batchPromise.then((result) => result[entry.params.name] || []));
    }

    try {
      await batchPromise;
      for (const k of keysToFetch) {
        const entry = batch.get(k)!;
        const data = await this.pending.get(k)!;
        this.cache.set(k, data);
        this.pending.delete(k);
        for (const d of entry.resolvers) d.resolve(data);
      }
    } catch (err) {
      for (const k of keysToFetch) {
        const entry = batch.get(k)!;
        this.pending.delete(k);
        for (const d of entry.resolvers) d.reject(err);
      }
    }
  }
}

/* 以 config.key 为键缓存 */
const cacheStore = new Map<string, DictionaryCache>();

export function getDictionaryCache(config: DictionaryConfig): DictionaryCache {
  const { key, service, time } = config;

  let cache = cacheStore.get(key);
  if (!cache) {
    cache = new DictionaryCache(key, service, time);
    cacheStore.set(key, cache);
  }
  return cache;
}