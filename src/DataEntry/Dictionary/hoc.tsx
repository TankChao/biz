import React, { useMemo } from 'react';
import { type DictionaryService } from './cache';
import { DictionaryConfigContext } from './context';
import DictionaryInner from './index';
import { checkDuplicateKey, isDev } from './validate';

/**
 * 高阶组件：注入字典查询配置
 *
 * 通过柯里化的方式，将字典服务配置（key、service、time）注入到
 * `DictionaryConfigContext` 中，使被包裹的组件能够通过 Context
 * 获取对应的字典查询能力。
 * @param key - 字典的唯一标识键，用于区分不同的字典实例
 * @param service - 字典查询服务实例，提供字典数据的获取能力
 * @param time - 缓存时间（毫秒），默认为 100ms，控制字典数据的缓存周期
 * @returns 一个高阶组件工厂函数，接收被包裹组件并返回注入配置后的新组件
 * @example
 * const MyDict = setDictionaryConfig('my-dict', myService, 100)(Dictionary);
 *
 */
export function setDictionaryConfig(
  key: string,
  service: DictionaryService,
  time: number = 100,
) {
  /* 开发环境下检测重复的 cache key（在模块加载时检测，避免 React StrictMode 误报） */
  if (isDev()) {
    checkDuplicateKey(key);
  }

  return function withDictionaryConfig<
    P extends React.ComponentProps<typeof DictionaryInner>,
  >(WrappedComponent: React.ComponentType<P>) {
    return function DictionaryWithService(props: P) {
      const value = useMemo(() => ({ key, service, time }), [key, service, time]);
      return (
        <DictionaryConfigContext.Provider value={value}>
          <WrappedComponent {...props} />
        </DictionaryConfigContext.Provider>
      );
    };
  };
}