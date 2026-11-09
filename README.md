# @kachina/biz

基于 antd v6 的业务组件库，提炼通用业务场景，以工厂模式生成组件，保持 API 一致性，赋能开发团队。

## 特性

- 🏭 **工厂模式** — 根据实际业务场景生成特定组件，同时保持 API 一致性
- 💎 **业务提炼** — 多维度分析业务代码，提炼可复用的业务组件
- 📦 **TypeScript** — 完整的类型定义，开箱即用

## 安装

```bash
npm install @kachina/biz
```

## 环境要求

| 依赖 | 版本 |
| --- | --- |
| React | >= 18.0.0 |
| React DOM | >= 18.0.0 |
| antd | ^6.0.0 |

## 组件总览

### 数据录入

| 组件 | 说明 |
| --- | --- |
| [Dictionary](#dictionary) | 字典选择组件，内置请求合并、批量查询与缓存 |
| [DatePicker](#datepicker) | 日期选择组件，value/onChange 值为 string 类型 |

### 交互

| 组件 | 说明 |
| --- | --- |
| [Operate](#operate) | 工厂化操作组件，弹窗式业务操作，兼容 Form 表单 |

---

## Dictionary

基于 antd Select 的字典选择组件，内置请求合并、批量查询与缓存能力。通过 `setDictionaryConfig` 注入后端服务后即可使用，适合将枚举类字典数据（如状态、性别、类型等）快速接入表单。

### 基本使用

```tsx
import { Dictionary, setDictionaryConfig } from '@kachina/biz';

// 注入后端服务
const fetchDictionary = async (names: string[]) => {
  const res = await request('/api/dictionary/batch', {
    method: 'POST',
    data: { names },
  });
  return res.data;
};

const DictSelect = setDictionaryConfig('my-dict', fetchDictionary, 100)(Dictionary);

export default () => (
  <DictSelect
    placeholder="请选择状态"
    params={{ name: 'status' }}
    style={{ width: 200 }}
  />
);
```

### API

#### DictionaryProps

继承 antd `SelectProps`，额外属性：

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| params | 字典查询参数，其中 `name` 字段用于标识字典 | `DictionaryParams` | — |
| children | 自定义渲染，传入函数可获取 Select props 与匹配出的 label | `ReactNode \| ((props) => ReactNode)` | — |

#### setDictionaryConfig

```ts
function setDictionaryConfig(
  cacheKey: string,
  fetcher: (names: string[]) => Promise<DictionaryItem[]>,
  time?: number,
): (Component: typeof Dictionary) => typeof Dictionary;
```

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| cacheKey | 缓存键名，用于区分不同的字典服务 | `string` | — |
| fetcher | 后端服务接口，接收字典名称数组，返回字典数据 | `(names: string[]) => Promise<DictionaryItem[]>` | — |
| time | 拦截一定时间内的字典请求，将入参合并后发起一次接口请求 | `number` | `100` |

#### DictionaryItem

```ts
interface DictionaryItem {
  label: string;
  value: string;
  [key: string]: any;
}
```

### 注意事项

1. 必须通过 `setDictionaryConfig` 注入后端服务后才能使用
2. 同一 `cacheKey` 的字典选择器会共享请求合并窗口
3. 多选模式下，`value` 和 `onChange` 的类型为 `string[]`

---

## DatePicker

基于 antd DatePicker 的日期选择组件，将 `value` / `onChange` 的值类型从 `Dayjs` 调整为 `string`，更方便地与表单数据对接。

### 基本使用

```tsx
import { DatePicker } from '@kachina/biz';

export default () => <DatePicker style={{ width: 200 }} />;
```

### 受控模式

```tsx
import { DatePicker } from '@kachina/biz';
import { useState } from 'react';

export default () => {
  const [value, setValue] = useState<string>('');
  return (
    <DatePicker
      value={value}
      onChange={(val) => setValue(val)}
      style={{ width: 200 }}
    />
  );
};
```

### API

#### DatePickerProps

继承 antd `DatePickerProps`，主要差异属性：

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| value | 当前日期值（字符串） | `string` | — |
| defaultValue | 默认日期值（字符串） | `string` | — |
| picker | 日期选择器类型 | `'date' \| 'month' \| 'year'` | `'date'` |
| format | 日期格式，`value` 与 `format` 保持一致 | `string` | date: `YYYY-MM-DD`；month: `YYYY-MM`；year: `YYYY` |
| onChange | 值变化回调 | `(value: string, date: Dayjs \| null) => void` | — |

### 注意事项

1. `value` 和 `defaultValue` 均为 `string` 类型，格式需与 `format` 一致
2. `picker` 仅支持 `date`、`month`、`year` 三种类型
3. `onChange` 第一个参数为格式化后的日期字符串，第二个参数为 dayjs 对象（清空时为 `null`）

---

## Operate

工厂化操作组件，通过 `createOperate` 注入 `content` 和 `fieldNames` 后即可生成一个业务操作组件。用户通过点击触发元素（Button / Select）弹出 Modal 进行操作，兼容 Form 表单的 `value` / `onChange`。

**后续生成的所有业务组件共享一套 API，开发只需要熟练掌握一套 API，即可熟练使用所有衍生组件。**

### 基本使用

```tsx
import { Operate, createOperate } from '@kachina/biz';

// 1. 定义弹窗内容组件
const MyContent: React.FC<ContentProps> = ({ open, closeModal, onChange }) => {
  // 你的业务逻辑
  return <div>...</div>;
};

// 2. 通过 createOperate 生成业务组件
const MyOperate = createOperate(Operate, {
  content: MyContent,
  fieldNames: { label: 'name', value: 'id' },
  touchType: 'button',
  valueType: 'Key',
});

// 3. 使用
export default () => (
  <MyOperate>查看详情</MyOperate>
);
```

### API

#### createOperate

```ts
function createOperate(
  BaseOperate: typeof Operate,
  configData: OperateConfig,
): ConfiguredOperateComponent;
```

#### OperateConfig

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| content | 弹窗中的内容组件（**不可被覆盖**） | `ComponentType<ContentProps>` | — |
| fieldNames | 字段映射配置（**不可被覆盖**） | `FieldNames` | — |
| touchType | 触发器类型 | `'button' \| 'select'` | `'button'` |
| valueType | value 的类型 | `'Key' \| 'Item' \| 'Key[]' \| 'Item[]'` | `'Key'` |
| multiple | 是否多选 | `boolean` | `false` |
| titleModal | 弹窗标题 | `ReactNode` | — |
| placeholder | Select 的 placeholder | `ReactNode` | — |

#### Operate.Parent

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| touchType | 触发器类型 | `'button' \| 'select'` | — |
| valueType | value 的类型 | `'Key' \| 'Item' \| 'Key[]' \| 'Item[]'` | — |
| multiple | 是否多选 | `boolean` | — |
| titleModal | 弹窗标题 | `ReactNode` | — |

#### Operate.Item

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| disabled | 是否禁用 | `boolean` | `false` |
| disableOpen | 禁用后是否禁止打开弹窗 | `boolean` | `false` |
| value | 触发器绑定的 value | `any` | — |
| onChange | 触发器绑定的 onChange | `(value, options) => void` | — |
| params | 传给 content 的参数 | `any` | — |
| buttonProps | Button 组件的属性 | `ButtonProps` | — |
| selectProps | Select 组件的属性 | `Partial<SelectProps>` | — |
| modalProps | Modal 组件的属性 | `Partial<ModalProps>` | — |
| defaultOptions | 默认选项（Key 类型反显用） | `any[]` | — |

#### FieldNames

| 属性 | 说明 | 类型 |
| --- | --- | --- |
| label | label 字段名 | `string` |
| value | value 字段名（需保证唯一性） | `string` |
| labelRich | 自定义 label 渲染 | `(item: any) => ReactNode` |

#### 优先级

当 `Operate.Item`、`Operate.Parent`、`createOperate` 存在相同参数时：

- `Operate.Item` 权重最大
- `Operate.Parent` / `Operate` 次之
- `createOperate` 权重最小

`content` 和 `fieldNames` 只能通过 `createOperate` 设置，不可被覆盖。

### 注意事项

1. 必须通过 `createOperate` 注入 `content` 和 `fieldNames` 后才能使用
2. `fieldNames.value` 对应的字段在数据中必须具有唯一性
3. 多选模式下，`valueType` 必须为 `'Key[]'` 或 `'Item[]'`
4. 当 `touchType` 为 `'select'` 时，`fieldNames.label` 和 `fieldNames.value` 必须有值
5. 当 `valueType` 为 `'Key'` 或 `'Key[]'` 时，需要传入 `defaultOptions` 用于初始化反显

---

## 开发

```bash
# 安装依赖
npm install

# 启动文档站点
npm start

# 构建组件
npm run build

# 构建文档
npm run build:docs
```

## License

MIT
