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

## Form 表单集成


```tsx
import { DatePicker } from '@kachina/biz';
import { Form, Button, Descriptions } from 'antd';

export default () => {
  const [form] = Form.useForm();

  const handleFinish = (values: any) => {
    console.log('表单提交:', values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={{
        birthday: '',
        joinDate: '',
        reviewYear: '',
        reviewYearEnd: '2030'
      }}
      style={{ maxWidth: 480 }}
    >
      <Form.Item name="birthday" label="出生日期" rules={[{ required: true, message: '请选择出生日期' }]}>
        <DatePicker style={{ width: '100%' }} placeholder="请选择日期" />
      </Form.Item>

      <Form.Item name="joinDate" label="入职日期">
        <DatePicker style={{ width: '100%' }} placeholder="请选择日期" />
      </Form.Item>

      <Form.Item name="reviewYear" label="考核年份">
        <DatePicker picker="year" style={{ width: '100%' }} placeholder="请选择年份" />
      </Form.Item>

      <Form.Item name="reviewYearEnd" label="考核结束年份">
        <DatePicker picker="year" style={{ width: '100%' }} disabled />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          提交
        </Button>
      </Form.Item>

      <Form.Item noStyle shouldUpdate>
        {({ getFieldsValue }) => {
          const values = getFieldsValue();
          return (
            <Descriptions title="表单值" bordered size="small" column={1}>
              <Descriptions.Item label="birthday">
                {values.birthday || '未选择'}
              </Descriptions.Item>
              <Descriptions.Item label="joinDate">
                {values.joinDate || '未选择'}
              </Descriptions.Item>
              <Descriptions.Item label="reviewYear">
                {values.reviewYear || '未选择'}
              </Descriptions.Item>
            </Descriptions>
          );
        }}
      </Form.Item>
    </Form>
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