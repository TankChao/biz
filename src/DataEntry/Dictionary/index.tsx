import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Select, type SelectProps } from 'antd';
import { getDictionaryCache, type DictionaryParams, type DictionaryOption } from './cache';
import { DictionaryConfigContext } from './context';

/**
 * Dictionary 组件对应的 Props
 * 继承 antd Select 的大部分 props，额外新增 params 字段
 */
export interface DictionaryProps extends Omit<SelectProps, 'options' | 'children'> {
  /** 字典查询参数，其中 name 字段用于标识字典值 */
  params: DictionaryParams;
  /** 可选的 children，可以渲染 Select 组件，也可以将 Select 的 props 和匹配到的 label 一并传递给 children */
  children?: React.ReactNode | ((props: SelectProps & { label: React.ReactNode; options: DictionaryOption[] }) => React.ReactNode);
  /** 展示模式：'select' 渲染 Select 组件；'text' 只显示当前 value 对应的 label 文本，默认为 'select' */
  display?: 'select' | 'text';
  /** display 为 'text' 时，应用到 span 上的样式 */
  textStyle?: React.CSSProperties;
}

function DictionaryInner({ params, loading: externalLoading, children, display = 'select', textStyle, ...rest }: DictionaryProps) {
  const config = useContext(DictionaryConfigContext);
  const [options, setOptions] = useState<DictionaryOption[]>([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!config) {
      console.error('Dictionary 需要使用 setConfig 进行配置');
      return;
    }

    const cache = getDictionaryCache(config);

    setFetching(true);

    cache.fetch(params).then((data) => {
      setOptions(data);
      setFetching(false);
    }).catch((err) => {
      console.error(err);
      setOptions([]);
      setFetching(false);
    });

  }, [params, config]);

  // 根据 options 匹配 value 对应的 label
  const label = useMemo(() => {
    if (rest.value === null) return undefined;
    if (Array.isArray(rest.value)) {
      return rest.value.map(v => options.find(o => o.value === v)?.label ?? String(v)).join(', ');
    }
    return options.find(o => o.value === rest.value)?.label ?? String(rest.value);
  }, [options, rest.value]);

  const selectProps = { loading: externalLoading || fetching, options, ...rest };

  // display 为 text 时，只显示当前 value 对应的 label 文本
  if (display === 'text') {
    return <span style={textStyle}>{label}</span>;
  }

  if (children) {
    if (typeof children === 'function') {
      // render prop 模式，把 Select 的 props 和 label 传递出去
      return (children as (props: SelectProps & { label: React.ReactNode; options: DictionaryOption[] }) => React.ReactNode)({ ...selectProps, label });
    }
    // React 元素模式，通过 cloneElement 注入 props
    return React.cloneElement(children as React.ReactElement<any>, { ...selectProps, label } as any);
  }

  return <Select {...selectProps} />;
}

export default DictionaryInner;