import React from 'react';
import { OperateConfigContext } from './context';
import OperateParent from './OperateParent';
import OperateItem from './OperateItem';
import Operate from './Operate';
import { validateConfig } from './validate';
import type {
  OperateConfig,
  OperateProps,
  OperateParentProps,
  ConfiguredOperateComponent,
} from './types';

/**
 * 工厂函数：通过配置 content、fieldNames 等生成一个操作类组件。
 *
 * @param _BaseOperate 基础 Operate 组件
 * @param configData   配置数据（content / fieldNames 不可被后续覆盖）
 *
 * @example
 * const MyOperate = setOperateConfig(Operate, {
 *   content: MyContent,
 *   fieldNames: { label: 'name', value: 'id' },
 * });
 *
 * // 便捷用法
 * <MyOperate touchType="button" titleModal="详情" />
 *
 * // 组合用法
 * <MyOperate.Parent><MyOperate.Item /></MyOperate.Parent>
 */
function setOperateConfig(
  _BaseOperate: typeof Operate,
  configData: OperateConfig,
): ConfiguredOperateComponent {
  // ── 开发环境校验 ──
  if (process.env.NODE_ENV === 'development') {
    validateConfig(configData);
  }

  // ── 配置 Provider ──
  const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => (
    <OperateConfigContext.Provider value={configData}>
      {children}
    </OperateConfigContext.Provider>
  );

  // ── 配置化的 Operate 便捷组件 ──
  const ConfiguredOperate = ((props: OperateProps) => (
    <ConfigProvider>
      <Operate {...props} />
    </ConfigProvider>
  )) as ConfiguredOperateComponent;

  // ── 配置化的 Parent ──
  const ConfiguredParent: React.FC<OperateParentProps> = (
    props: OperateParentProps,
  ) => (
    <ConfigProvider>
      <OperateParent {...props} />
    </ConfigProvider>
  );

  ConfiguredOperate.Parent = ConfiguredParent;
  ConfiguredOperate.Item = OperateItem;

  return ConfiguredOperate;
}

export default setOperateConfig;
