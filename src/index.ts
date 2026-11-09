// @kachina/biz 入口文件

// 数据录入组件
export { setDictionaryConfig } from './DataEntry/Dictionary/hoc';
export { default as Dictionary } from './DataEntry/Dictionary/index';
export type { DictionaryProps } from './DataEntry/Dictionary/index';
export type { DictionaryParams, DictionaryOption, DictionaryService, DictionaryConfig } from './DataEntry/Dictionary/cache';
export { queryDictionaryDemo } from './DataEntry/Dictionary/service';
export { default as DatePicker } from './DataEntry/DatePicker/index';
export type { DatePickerProps, DatePickerPickerType } from './DataEntry/DatePicker/index';

// 交互组件
export { setOperateConfig } from './Interaction/Operate';
export type {
  ValueType,
  TouchType,
  FieldNames,
  ContentProps,
  OperateConfig,
  OperateParentProps,
  OperateItemProps,
  OperateProps,
  ConfiguredOperateComponent,
} from './Interaction/Operate';
