import React, { useContext } from 'react';
import { createOperateIndependent } from './createOperateIndependent';
import { createOperateParent } from './createOperateParent';
import { createOperateItem } from './createOperateItem';
import { createOperateContexts } from './context';
import { validateConfig } from './validate';
import type {
  OperateConfig,
  OperateProps,
  OperateParentProps,
  OperateItemProps,
  ConfiguredOperateComponent,
} from './types';

/**
 * 工厂函数：通过配置 content、fieldNames 等生成一个操作类组件。
 *
 * 每次调用都会创建一组完全独立的 Context（配置 Context + Parent Context），
 * 因此不同 createOperate 生成的组件互不串扰，可以任意嵌套使用。
 *
 * @param configData   配置数据（content / fieldNames 不可被后续覆盖）
 *
 * @example
 * const MyOperate = createOperate({
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
function createOperate(
  configData: OperateConfig,
): ConfiguredOperateComponent {
  // ── 开发环境校验 ──
  if (process.env.NODE_ENV === 'development') {
    validateConfig(configData);
  }

  // ── 每个配置化组件拥有自己独立的 Context，互不串扰 ──
  const { ConfigContext, ParentContext } = createOperateContexts(configData);

  const MyOperateParent = createOperateParent(ConfigContext, ParentContext);
  const MyOperateItem = createOperateItem(ConfigContext, ParentContext);

  // ── 配置化的 Operate 便捷组件（Parent + Item） ──
  const ConfiguredOperate = createOperateIndependent(
    MyOperateParent,
    MyOperateItem,
  ) as ConfiguredOperateComponent;

  // ── 配置化的 Parent ──
  const ConfiguredParent: React.FC<OperateParentProps> = (
    props: OperateParentProps,
  ) => <MyOperateParent {...props} />;

  /**
   * 配置化的 Item。
   *
   * - 若 Item 已处于本配置的 Parent 内，则复用该 Parent 的弹窗（多个触发器共享一个 Modal）；
   * - 否则自动补一个本配置的 Parent，保证 Item 永远只使用自己这份配置。
   */
  const ConfiguredItem: React.FC<OperateItemProps> = (props: OperateItemProps) => {
    const parentCtx = useContext(ParentContext);

    if (parentCtx) {
      return <MyOperateItem {...props} />;
    }

    return (
      <MyOperateParent>
        <MyOperateItem {...props} />
      </MyOperateParent>
    );
  };

  ConfiguredOperate.Parent = ConfiguredParent;
  ConfiguredOperate.Item = ConfiguredItem;

  return ConfiguredOperate;
}

export default createOperate;
