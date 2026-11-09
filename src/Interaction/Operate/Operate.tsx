import type { ComponentType, ReactElement } from 'react';
import type {
  OperateProps,
  OperateParentProps,
  OperateItemProps,
} from './types';

/**
 * 组合 Operate.Parent + Operate.Item，得到便捷的 Operate 组件。
 *
 * @param BaseOperateParent 与 Item 共享同一对 Context 的 Parent 组件
 * @param BaseOperateItem   与 Parent 共享同一对 Context 的 Item 组件
 */
export function createOperate(
  BaseOperateParent: ComponentType<OperateParentProps>,
  BaseOperateItem: ComponentType<OperateItemProps>,
): (props: OperateProps) => ReactElement {
  return function Operate(props: OperateProps) {
    const {
      // Parent props
      touchType,
      valueType,
      multiple,
      titleModal,
      // Item props
      disabled,
      disableOpen,
      children,
      value,
      onChange,
      placeholder,
      params,
      buttonProps,
      selectProps,
      modalProps,
      defaultOptions,
    } = props;

    return (
      <BaseOperateParent
        touchType={touchType}
        valueType={valueType}
        multiple={multiple}
        titleModal={titleModal}
      >
        <BaseOperateItem
          disabled={disabled}
          disableOpen={disableOpen}
          value={value}
          onChange={onChange}
          titleModal={titleModal}
          placeholder={placeholder}
          params={params}
          buttonProps={buttonProps}
          selectProps={selectProps}
          modalProps={modalProps}
          defaultOptions={defaultOptions}
        >
          {children}
        </BaseOperateItem>
      </BaseOperateParent>
    );
  };
}
