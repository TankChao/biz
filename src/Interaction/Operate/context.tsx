import { createContext } from 'react';
import type { ComponentType, ReactNode } from 'react';
import type { ContentProps, FieldNames, TouchType, ValueType } from './types';

/** setOperateConfig 提供的配置上下文 */
export interface OperateConfigContextValue {
  content: ComponentType<ContentProps>;
  fieldNames: FieldNames;
  titleModal?: ReactNode;
  placeholder?: ReactNode;
  touchType?: TouchType;
  valueType?: ValueType;
  multiple?: boolean;
}

export const OperateConfigContext = createContext<OperateConfigContextValue | null>(null);

/** Item 打开弹窗时传递给 Parent 的数据 */
export interface ItemModalData {
  titleModal?: ReactNode;
  params?: any;
  onChange?: (value: any, options: any) => void;
  disabled?: boolean;
  modalProps?: Record<string, any>;
}

/** Operate.Parent 提供的上下文 */
export interface OperateParentContextValue {
  /** 打开弹窗 */
  openModal: (itemData: ItemModalData) => void;
  /** 合并后的触发器类型 */
  mergedTouchType: TouchType;
  /** 合并后的值类型 */
  mergedValueType: ValueType;
  /** 合并后的多选标志 */
  mergedMultiple: boolean;
  /** 合并后的弹窗标题 */
  mergedTitleModal?: ReactNode;
  /** 合并后的 placeholder */
  mergedPlaceholder?: ReactNode;
  /** fieldNames（来自 setOperateConfig，不可覆盖） */
  fieldNames: FieldNames;
}

export const OperateParentContext = createContext<OperateParentContextValue | null>(null);
