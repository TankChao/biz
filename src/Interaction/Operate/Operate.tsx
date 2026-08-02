import React from 'react';
import OperateParent from './OperateParent';
import OperateItem from './OperateItem';
import type { OperateProps } from './types';

/**
 * Operate 便捷组件
 * 等价于 <Operate.Parent><Operate.Item /></Operate.Parent>
 * 适用于单个触发器的场景。
 */
function Operate(props: OperateProps) {
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
    <OperateParent
      touchType={touchType}
      valueType={valueType}
      multiple={multiple}
      titleModal={titleModal}
    >
      <OperateItem
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
      </OperateItem>
    </OperateParent>
  );
}

export default Operate;
