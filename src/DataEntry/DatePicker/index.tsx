import React, { useMemo } from 'react';
import { DatePicker as AntDatePicker } from 'antd';
import type { DatePickerProps as AntDatePickerProps } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';

/** 支持的 picker 类型 */
export type DatePickerPickerType = 'date' | 'month' | 'year';

/** 根据 picker 类型获取默认格式 */
const getDefaultFormat = (picker?: DatePickerPickerType): string => {
  switch (picker) {
    case 'month':
      return 'YYYY-MM';
    case 'year':
      return 'YYYY';
    case 'date':
    default:
      return 'YYYY-MM-DD';
  }
};

/**
 * 从 format prop 中解析出实际使用的格式字符串
 * 仅处理 string 类型，其他类型回退到默认格式
 */
const resolveFormatString = (
  format: AntDatePickerProps['format'],
  picker?: DatePickerPickerType,
): string => {
  if (typeof format === 'string') return format;
  return getDefaultFormat(picker);
};

/** DatePicker 组件 Props */
export interface DatePickerProps
  extends Omit<AntDatePickerProps, 'value' | 'defaultValue' | 'onChange' | 'picker'> {
  /** 当前日期值（字符串格式，与 format 一致） */
  value?: string;
  /** 默认日期值（字符串格式，与 format 一致） */
  defaultValue?: string;
  /** 日期选择器类型，仅支持 date / month / year */
  picker?: DatePickerPickerType;
  /**
   * 值变化回调
   * @param value 格式化后的日期字符串（与 format 一致）
   * @param date  dayjs 对象，清空时为 null
   */
  onChange?: (value: string, date: Dayjs | null) => void;
}

function DatePickerInner(props: DatePickerProps) {
  const {
    value,
    defaultValue,
    onChange,
    picker,
    format,
    ...restProps
  } = props;

  // 根据 picker 和 format 确定实际使用的格式字符串
  const formatStr = useMemo(
    () => resolveFormatString(format, picker),
    [format, picker],
  );

  // 将 string value 转换为 dayjs 对象供 antd DatePicker 使用
  const dayjsValue = useMemo<Dayjs | null>(() => {
    if (value === undefined || value === '') return null;
    return dayjs(value, formatStr);
  }, [value, formatStr]);

  const dayjsDefaultValue = useMemo<Dayjs | null>(() => {
    if (defaultValue === undefined || defaultValue === '') return null;
    return dayjs(defaultValue, formatStr);
  }, [defaultValue, formatStr]);

  // antd onChange: (date: Dayjs | null, dateString: string | string) => void
  // 转换为: (value: string, date: Dayjs | null) => void
  const handleChange = (date: Dayjs | null, dateString: string | string[]) => {
    if (onChange) {
      const str = Array.isArray(dateString) ? dateString[0] : dateString;
      onChange(str, date);
    }
  };

  return (
    <AntDatePicker
      {...restProps}
      picker={picker}
      format={format}
      value={dayjsValue as any}
      defaultValue={dayjsDefaultValue as any}
      onChange={handleChange as any}
    />
  );
}

export default DatePickerInner;
