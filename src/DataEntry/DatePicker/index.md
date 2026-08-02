---
title: DatePicker 日期选择
nav:
  title: 组件
  order: 1
group:
  title: 数据录入
toc: content
---

# DatePicker

基于 antd DatePicker 的日期选择组件，将 `value` / `onChange` 的值类型从 `Dayjs` 调整为 `string`，更方便地与表单数据对接。

## 何时使用

当需要将日期选择器的值以字符串形式（而非 dayjs 对象）管理时，使用此组件。适用于表单值统一为 `string` 类型的场景，避免在组件外部手动进行 dayjs ↔ string 的转换。

## 基本使用

```tsx
import { DatePicker } from '@kachina/biz';

export default () => <DatePicker style={{ width: 200 }} />;
```

## 月份选择

```tsx
import { DatePicker } from '@kachina/biz';

export default () => <DatePicker picker="month" style={{ width: 200 }} />;
```

## 年份选择

```tsx
import { DatePicker } from '@kachina/biz';

export default () => <DatePicker picker="year" style={{ width: 200 }} />;
```

## 自定义格式

```tsx
import { DatePicker } from '@kachina/biz';

export default () => (
  <DatePicker format="YYYY/MM/DD" style={{ width: 200 }} />
);
```

## 受控模式

通过 `value` 和 `onChange` 实现受控，`value` 为 `string` 类型。

```tsx
import { DatePicker } from '@kachina/biz';
import { useState } from 'react';

export default () => {
  const [value, setValue] = useState<string>('');
  return (
    <div>
      <DatePicker
        value={value}
        onChange={(val) => setValue(val)}
        style={{ width: 200 }}
      />
      <div style={{ marginTop: 8 }}>当前值：{value || '未选择'}</div>
    </div>
  );
};
```

## API

### DatePickerProps

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| value | 当前日期值（字符串） | `string` | - |
| defaultValue | 默认日期值（字符串） | `string` | - |
| picker | 日期选择器类型 | `'date' \| 'month' \| 'year'` | `'date'` |
| format | 日期格式，字符串类型的值与 format 保持一致 | `string` | date: `YYYY-MM-DD`；month: `YYYY-MM`；year: `YYYY` |
| onChange | 值变化回调 | `(value: string, date: Dayjs \| null) => void` | - |
| ... | 其余 antd DatePicker 属性 | - | - |

## 注意事项

1. `value` 和 `defaultValue` 均为 `string` 类型，格式需与 `format` 保持一致；其他字段均与 antd DatePicker 一致；
2. `picker` 仅支持 `date`、`month`、`year` 三种类型
3. `onChange` 第一个参数为格式化后的日期字符串，第二个参数为 dayjs 对象（清空时为 `null`）
4. 其余 antd DatePicker 属性（如 `disabled`、`placeholder`、`size` 等）均可透传