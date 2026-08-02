---
title: Dictionary 字典
nav:
  title: 组件
  order: 1
group:
  title: 数据录入
toc: content
---

# Dictionary

基于 antd Select 的字典选择组件，支持批量合并查询与缓存机制。通过 `setDictionaryConfig` 注册字典服务后即可使用，适合加载枚举/字典数据（如状态、对比类型等），减少接口调用。

## 何时使用

当页面中存在多个相同的字典选择器时，字典组件挂载后会自动合并时间窗口内的请求，在服务端响应之前即可开启，同时通过缓存机制减少重复查询。

## 核心示例（100ms 合并窗口展示）

以下示例直观展示 Dictionary 的批量合并能力。40 个字典实例以 10ms 间隔依次挂载，前 20 个为 `select` 下拉，后 20 个为 `text` 文本展示，合并窗口设为 100ms。底部日志面板会实时打印每次实际发起请求时 `fetcher` 收到的合并请求数量，可以看到大量请求被自动聚合为一次批量调用。

```tsx
import { Dictionary, setDictionaryConfig } from '@kachina/biz';
import type { DictionaryParams } from '@kachina/biz';
import { useState, useEffect, useReducer } from 'react';

const logsRef: { current: string[] } = { current: [] };

const fetcher = async (paramsList: DictionaryParams[]) => {
  const ts = new Date().toLocaleTimeString('zh-CN', { fractionalSecondDigits: 3 });
  const names = paramsList.map((p) => p.name);
  logsRef.current.push(
    `[${ts}] 合并请求 → paramsList(${paramsList.length}): ${JSON.stringify(paramsList)}`,
  );
  
  const res = Object.fromEntries(
    paramsList.map((p) => [
      p.name,
      [
        { label: `${p.name} - 选项0`, value: '0' },
        { label: `${p.name} - 选项1`, value: '1' },
      ],
    ]),
  );
  return res
};

const DictComp = setDictionaryConfig('demo-id-9', fetcher, 100)(Dictionary);

export default () => {
  const [count, setCount] = useState(0);
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    for (let i = 1; i <= 40; i++) {
      timers.push(setTimeout(() => setCount(i), i * 10));
    }
    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: 12,
          marginBottom: 16,
        }}
      >
        {Array.from({ length: count }, (_, i) => (
          <DictComp
            key={i}
            params={{ name: `dict_${String(i).padStart(2, '0')}` }}
            display={i < 20 ? 'select' : 'text'}
            placeholder={i < 20 ? 'Select' : ''}
            // selectProps={{ defaultValue: '0' }}
            // value={i < 20 ? undefined : '0'}
            value='0'
            style={{ width: '100%' }}
          />
        ))}
      </div>
      <div
        style={{
          background: '#f6f8fa',
          border: '1px solid #e1e4e8',
          borderRadius: 6,
          padding: 12,
          fontFamily: 'monospace',
          fontSize: 13,
          minHeight: 60,
          maxHeight: 240,
          overflowY: 'auto',
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 8 }}>
          ?? 实时合并日志（窗口 100ms）：
        </div>
        {logsRef.current.length === 0 && (
          <div style={{ color: '#999' }}>等待请求合并...</div>
        )}
        {logsRef.current.map((log, i) => (
          <div key={i} style={{ color: '#24292e', lineHeight: 1.8 }}>
            {log}
          </div>
        ))}
      </div>
    </div>
  );
};
```




## 基础使用

```tsx
import { Dictionary, queryDictionaryDemo, setDictionaryConfig } from '@kachina/biz';

const DictSelect = setDictionaryConfig('my-dict', queryDictionaryDemo, 100)(Dictionary);

export default () => (
  <DictSelect
    placeholder="请选择状态"
    params={{ name: 'status' }}
    style={{ width: 200 }}
  />
);
```


## 自定义后端接口实例

通过 `setDictionaryConfig` 注册真实的后端服务接口。

```tsx
import { Dictionary, setDictionaryConfig } from '@kachina/biz';
import { request } from 'umi';

// 替换为真实的后端接口
const fetchDictionary = async (names: string[]) => {
  return {
    status: [
      { label: '启用', value: 1 },
      { label: '禁用', value: 0 },
    ]
  }
};

const DictSelect = setDictionaryConfig('demo-id-7', fetchDictionary, 100)(Dictionary);

export default () => (
  <DictSelect
    placeholder="请选择状态"
    params={{ name: 'status' }}
    style={{ width: 200 }}
  />
);
```

## 调整合并时间窗口

通过 `setDictionaryConfig` 的第三个参数可以调整请求合并的窗口期（ms）。数值越大，越多请求会被合并为一次批量调用。

```tsx
import { Dictionary, queryDictionaryDemo, setDictionaryConfig } from '@kachina/biz';

const DictSelect = setDictionaryConfig('demo-id-1', queryDictionaryDemo, 200)(Dictionary);

export default () => (
  <DictSelect
    placeholder="请选择"
    params={{ name: 'status' }}
    style={{ width: 200 }}
  />
);
```

## 多选模式

通过 `mode="multiple"` 开启多选，支持 antd Select 原有属性，如 `maxTagCount`、`tokenSeparators` 等，均可透传。

```tsx
import { Dictionary, queryDictionaryDemo, setDictionaryConfig } from '@kachina/biz';

const DictSelect = setDictionaryConfig('demo-id-2', queryDictionaryDemo)(Dictionary);

export default () => (
  <DictSelect
    mode="multiple"
    placeholder="请选择"
    params={{ name: 'status' }}
    style={{ width: 300 }}
    maxTagCount={2}
  />
);
```

## 文本模式展示

通过 `display="text"` 可以将组件切换为纯文本模式。此时不再渲染 Select 组件，而是直接展示当前 `value` 对应的字典 `label`，适用于表格等只需要展示文本的场景。

```tsx
import { Dictionary, queryDictionaryDemo, setDictionaryConfig } from '@kachina/biz';
import { useState } from 'react';
import { Button, Space } from 'antd';

const DictSelect = setDictionaryConfig('demo-id-3', queryDictionaryDemo, 100)(Dictionary);

export default () => {
  const [value, setValue] = useState(1);
  return (
    <Space orientation="vertical" size={16}>
      <Space>
        <Button onClick={() => setValue(1)}>设为 1</Button>
        <Button onClick={() => setValue(0)}>设为 0</Button>
      </Space>
      <DictSelect
        params={{ name: 'status' }}
        value={value}
        display="text"
      />
    </Space>
  );
};
```

## 自定义文本样式

在 `display="text"` 模式下，可以通过 `textStyle` 属性为展示文本添加自定义样式。

```tsx
import { Dictionary, queryDictionaryDemo, setDictionaryConfig } from '@kachina/biz';

const DictSelect = setDictionaryConfig('demo-id-4', queryDictionaryDemo, 100)(Dictionary);

export default () => (
  <DictSelect
    params={{ name: 'status' }}
    value={1}
    display="text"
    textStyle={{ color: '#52c41a', fontWeight: 'bold', fontSize: 16 }}
  />
);
```

## 自定义渲染

通过 `optionRender` 属性可以自定义下拉选项的渲染内容。

```tsx
import { Dictionary, queryDictionaryDemo, setDictionaryConfig } from '@kachina/biz';

const DictSelect = setDictionaryConfig('demo-id-6', queryDictionaryDemo)(Dictionary);

export default () => (
  <DictSelect
    placeholder="请选择状态"
    params={{ name: 'status' }}
    style={{ width: 200 }}
    optionRender={(option) => (
      <span>
        <span style={{ color: '#1890ff' }}>{option.label}</span>
        <span style={{ color: '#999', marginLeft: 8 }}>({option.value})</span>
      </span>
    )}
  />
);
```

## API

### DictionaryProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| params | 字典查询参数对象，用于传递查询条件 | `Record<string, any>` | - |
| display | 展示模式：`select` 渲染 Select 下拉组件；`text` 只展示当前 value 对应的 label 文本 | `'select' \| 'text'` | `'select'` |
| textStyle | `display="text"` 时，应用到文本 `<span>` 上的样式 | `React.CSSProperties` | - |
| value | 当前选中的值（受控模式） | `string \| string[] \| undefined` | - |
| onChange | 值变化时的回调 | `(value: string \| string[]) => void` | - |
| mode | 选择模式：`multiple` 为多选 | `'multiple' \| undefined` | - |
| maxTagCount | 多选时最多显示的标签数量 | `number` | - |
| tokenSeparators | 自动分词的分隔符 | `string[]` | - |
| optionRender | 自定义选项渲染 | `(option: OptionType) => React.ReactNode` | - |
| ... | 其余 antd Select 属性 | - | - |

### setDictionaryConfig

```ts
function setDictionaryConfig(
  cacheKey: string,
  fetcher: (names: string[]) => Promise<DictionaryItem[]>,
  time?: number
): (Component: typeof Dictionary) => typeof Dictionary;
```

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| cacheKey | 缓存标识键，用于区分不同的字典实例 | `string` | - |
| fetcher | 后端服务接口，接收字典名称数组，返回字典数据 | `(names: string[]) => Promise<DictionaryItem[]>` | - |
| time | 请求合并窗口期（ms），数值越大合并范围越广 | `number` | `100` |

### 类型定义

```ts
interface DictionaryItem {
  label: string;
  value: string;
  [key: string]: any;
}
```

## 注意事项

1. 必须通过 `setDictionaryConfig` 注册后端服务后使用
2. 同一 `cacheKey` 的字典选择器会共享请求合并窗口
3. 多选模式下，`value` 和 `onChange` 类型应为 `string[]`
4. `display="text"` 模式下不渲染 Select，只展示文本内容（只读展示）
