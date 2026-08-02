import type { DictionaryParams, DictionaryOption, DictionaryService } from './cache';

/** 将 DictionaryParams 和 DictionaryService 同步导出，方便业务方引用 */
export type { DictionaryParams, DictionaryOption, DictionaryService } from './cache';

/**
 * 示例字典查询服务
 *
 * 实际使用时可替换为真实接口调用：
 *   const MyService: DictionaryService = async (paramsList) => {
 *     const res = await fetch('/api/dict/batch', {
 *       method: 'POST',
 *       body: JSON.stringify(paramsList),
 *     });
 *     return res.json();
 *   };
 */
export const queryDictionaryDemo: DictionaryService = async (paramsList) => {
  /* 模拟网络延迟 */
  await new Promise((r) => setTimeout(r, 300));

  const result: Record<string, DictionaryOption[]> = {};

  /* 模拟静态字典数据 */
  const mockDict: Record<string, DictionaryOption[]> = {
    status: [
      { label: '启用', value: 1 },
      { label: '禁用', value: 0 },
    ],
    gender: [
      { label: '男', value: 'male' },
      { label: '女', value: 'female' },
    ],
    type: [
      { label: '类型A', value: 'a' },
      { label: '类型B', value: 'b' },
      { label: '类型C', value: 'c' },
    ],
  };

  for (const p of paramsList) {
    /* 优先使用预定义的 mock 数据；对于 dict_XX 格式的名称，自动生成模拟选项 */
    if (mockDict[p.name]) {
      result[p.name] = mockDict[p.name];
    } else if (/^dict_\d+$/.test(p.name)) {
      /* 为 dict_XX 自动生成 3 个选项，value 为 0、1、2 */
      const idx = parseInt(p.name.replace('dict_', ''), 10);
      result[p.name] = [
        { label: `${p.name} - 选项0`, value: 0 },
        { label: `${p.name} - 选项1`, value: 1 },
        { label: `${p.name} - 选项2`, value: 2 },
      ];
    } else {
      result[p.name] = [];
    }
  }

  return result;
};
