---
title: Operate 操作组件
nav:
  title: 组件
  order: 1
group:
  title: 交互
toc: content
---

# Operate

工厂化操作组件，通过 `createOperate` 注入 `content` 和 `fieldNames` 后即可生成一个业务操作组件。用户通过点击触发元素（Button / Select）弹出 Modal 进行操作，兼容 Form 表单的 `value` / `onChange`。

**后续生成的所有业务组件共享一套API，开发只需要熟练掌握一套API，即可熟练使用所有衍生组件。**

## 何时使用

- 需要在表格行内或表单中嵌入弹窗操作
- 多个触发器共享同一个 Modal 实例
- 需要兼容 Form 表单的受控模式


## 基本用法 - Button 触发器

多个表格行共享一个 Modal，每行点击"查看详情"打开弹窗，弹窗标题跟随子项变化。

<code src="./OperateDemo/ButtonDemo.tsx"></code>

## Select 触发器 - valueType = 'Item'

Select 触发器，value 类型为完整对象（Item），通过 `fieldNames` 映射 label / value 实现回显。

<code src="./OperateDemo/SelectItemDemo.tsx"></code>

## Select 触发器 - valueType = 'Key'

value 类型为基础类型（Key），需要传入 `defaultOptions` 用于页面初始化时的反显。

<code src="./OperateDemo/SelectKeyDemo.tsx"></code>

## Form 表单集成

在 `Form.Item` 中使用 `Operate.Item`，自动兼容 Form 的 `value` / `onChange` 注入。

<code src="./OperateDemo/FormDemo.tsx"></code>

## 多选模式

`valueType` 为 `'Key[]'` 或 `'Item[]'` 时开启多选，Select 以 tags 形式展示已选项，支持标签移除。

<code src="./OperateDemo/MultipleDemo.tsx"></code>

## Button 触发器禁用与禁用打开

`disabled` 控制触发器是否禁用，`disableOpen` 控制禁用后是否仍可打开弹窗（只读模式）。

<code src="./OperateDemo/DisableDemo.tsx"></code>

## Select 触发器的禁用与禁用打开

当 `touchType` 为 `'select'` 时，`disabled` 和 `disableOpen` 的组合效果，包含正常、禁用但可打开（只读模式）和完全禁用三种情况。

<code src="./OperateDemo/DisableSelectDemo.tsx"></code>

## fieldNames.labelRich 自定义渲染

通过 `fieldNames.labelRich` 自定义 Select 选项的 label 渲染，可组合多个字段。

<code src="./OperateDemo/LabelRichDemo.tsx"></code>

## API

### createOperate

```ts
function createOperate(
  configData: OperateConfig,
): ConfiguredOperateComponent;
```

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| configData | 配置数据 | `OperateConfig` | - |

### OperateConfig

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| content | 弹窗中的内容组件（**不可被覆盖**） | `ComponentType<ContentProps>` | - |
| fieldNames | 字段映射配置（**不可被覆盖**） | `FieldNames` | - |
| titleModal | 弹窗标题 | `ReactNode` | - |
| placeholder | Select 的 placeholder | `ReactNode` | - |
| touchType | 触发器类型 | `'button'  'select'` | `'button'` |
| valueType | value 的类型 | `'Key'  'Item'  'Key[]'  'Item[]'` | `'Key'` |
| multiple | 是否多选 | `boolean` | `false` |

### Operate.Parent

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| touchType | 触发器类型 | `'button'  'select'` | - |
| valueType | value 的类型 | `'Key'  'Item'  'Key[]'  'Item[]'` | - |
| multiple | 是否多选 | `boolean` | - |
| titleModal | 弹窗标题 | `ReactNode` | - |
| children | 子元素（Operate.Item） | `ReactNode` | - |

### Operate.Item

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| disabled | 是否禁用 | `boolean` | `false` |
| disableOpen | 禁用后是否禁止打开弹窗 | `boolean` | `false` |
| children | button 触发器时作为按钮文本 | `ReactNode` | - |
| value | 触发器绑定的 value | `any` | - |
| onChange | 触发器绑定的 onChange | `(value, options) => void` | - |
| titleModal | 弹窗标题（与子项相关） | `ReactNode` | - |
| placeholder | Select 的 placeholder | `ReactNode` | - |
| params | 传给 content 的参数 | `any` | - |
| buttonProps | Button 组件的属性 | `ButtonProps` | - |
| selectProps | Select 组件的属性 | `Partial<SelectProps>` | - |
| modalProps | Modal 组件的属性 | `Partial<ModalProps>` | - |
| defaultOptions | 默认选项（Key 类型反显用） | `any[]` | - |

### ContentProps（content 组件接收的 props）

| 属性 | 说明 | 类型 |
| --- | --- | --- |
| open | 弹窗是否打开 | `boolean` |
| closeModal | 关闭弹窗 | `() => void` |
| multiple | 是否多选 | `boolean` |
| setFooter | 设置弹窗 footer | `(footer: ReactNode) => void` |
| disabled | 是否禁用 | `boolean` |
| onChange | 值变化回调 | `(value, options) => void` |
| params | 额外参数 | `any` |

### FieldNames

| 属性 | 说明 | 类型 |
| --- | --- | --- |
| label | label 字段名 | `string` |
| value | value 字段名（需保证唯一性） | `string` |
| labelRich | 自定义 label 渲染 | `(item: any) => ReactNode` |

## 优先级说明

当 `Operate.Item`、`Operate.Parent`、`createOperate` 存在相同参数时：

- `Operate.Item` 权重最大
- `Operate.Parent` / `Operate` 次之
- `createOperate` 权重最小

`content` 和 `fieldNames` 只能通过 `createOperate` 设置，不可被覆盖。

## 注意事项

1. 必须通过 `createOperate` 注入 `content` 和 `fieldNames` 后才能使用
2. `fieldNames.value` 对应的字段在数据中必须具有唯一性
3. 多选模式下，`valueType` 必须为 `'Key[]'` 或 `'Item[]'`
4. 当 `touchType` 为 `'select'` 时，`fieldNames.label` 和 `fieldNames.value` 必须有值
5. 当 `valueType` 为 `'Key'` 或 `'Key[]'` 时，需要传入 `defaultOptions` 用于初始化反显
6. 多个 `createOperate` 生成的组件相互独立，即使嵌套在不同 Parent 中使用，`Item` 也只会绑定自己这份配置，不会串用其他组件的弹窗内容




