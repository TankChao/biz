import type { ReactNode, ComponentType, ReactElement } from 'react';
import type { ButtonProps, SelectProps, ModalProps } from 'antd';

/** 值类型：Key 单选 | Item 单选 | Key[] 多选 | Item[] 多选 */
export type ValueType = 'Key' | 'Item' | 'Key[]' | 'Item[]';

/** 触发器类型 */
export type TouchType = 'button' | 'select';

/** fieldNames 配置，统一 options 字段读取 */
export interface FieldNames {
  label: string;
  value: string;
  labelRich?: (item: any) => ReactNode;
}

/** content 组件接收的 Props */
export interface ContentProps {
  /** 当前弹窗是否处于打开状态 */
  open: boolean;
  /** 关闭弹窗 */
  closeModal: () => void;
  /** 是否多选 */
  multiple: boolean;
  /** 设置弹窗的 footer */
  setFooter: (footer: ReactNode) => void;
  /** 是否禁用 */
  disabled: boolean;
  /** 值变化回调 */
  onChange: (value: any, options: any) => void;
  /** 额外参数 */
  params: any;
}

/** setOperateConfig 的配置参数 */
export interface OperateConfig {
  /** 弹窗中的内容组件（只能通过 setOperateConfig 设置，不可被覆盖） */
  content: ComponentType<ContentProps>;
  /** 字段映射配置（只能通过 setOperateConfig 设置，不可被覆盖） */
  fieldNames: FieldNames;
  /** 弹窗标题 */
  titleModal?: ReactNode;
  /** Select 的 placeholder */
  placeholder?: ReactNode;
  /** 触发器类型 */
  touchType?: TouchType;
  /** value 的类型 */
  valueType?: ValueType;
  /** 是否多选 */
  multiple?: boolean;
}

/** Operate.Parent 的 Props */
export interface OperateParentProps {
  /** 触发器类型 */
  touchType?: TouchType;
  /** value 的类型 */
  valueType?: ValueType;
  /** 是否多选 */
  multiple?: boolean;
  /** 弹窗标题 */
  titleModal?: ReactNode;
  children?: ReactNode;
}

/** Operate.Item 的 Props */
export interface OperateItemProps {
  /** 是否禁用 */
  disabled?: boolean;
  /** 禁用后是否禁止打开弹窗 */
  disableOpen?: boolean;
  /** button 触发器时，作为 button 的子元素 */
  children?: ReactNode;
  /** 触发器绑定的 value */
  value?: any;
  /** 触发器绑定的 onChange */
  onChange?: (value: any, options: any) => void;
  /** 弹窗标题（与子项相关） */
  titleModal?: ReactNode;
  /** Select 的 placeholder */
  placeholder?: ReactNode;
  /** 传给 content 的参数 */
  params?: any;
  /** Button 组件的属性 */
  buttonProps?: ButtonProps;
  /** Select 组件的属性 */
  selectProps?: Partial<SelectProps>;
  /** Modal 组件的属性 */
  modalProps?: Partial<ModalProps>;
  /** 默认选项（用于 Key 类型反显） */
  defaultOptions?: any[];
}

/** Operate 便捷组件的 Props（Parent + Item 的合并） */
export interface OperateProps extends OperateParentProps, OperateItemProps {}

/** setOperateConfig 返回的配置化组件类型 */
export interface ConfiguredOperateComponent {
  (props: OperateProps): ReactElement;
  Parent: ComponentType<OperateParentProps>;
  Item: ComponentType<OperateItemProps>;
}
