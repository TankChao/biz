import React, { useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { Context } from 'react';
import { Modal } from 'antd';
import type {
  ItemModalData,
  OperateConfigContextValue,
  OperateParentContextValue,
} from './context';
import type { OperateParentProps } from './types';
import {
  validateValueType,
  validateMultipleValueType,
  validateFieldNamesForSelect,
} from './validate';

/**
 * 创建 Operate.Parent 组件。
 *
 * 传入属于同一配置的一对 Context，使不同 createOperate 生成的组件
 * 拥有完全独立的上下文，互不串扰。
 */
export function createOperateParent(
  OperateConfigContext: Context<OperateConfigContextValue | null>,
  OperateParentContext: Context<OperateParentContextValue | null>,
) {
  return function OperateParent({
    children,
    touchType,
    valueType,
    multiple,
    titleModal,
  }: OperateParentProps) {
    const config = useContext(OperateConfigContext);

    // ── 开发环境校验 ──
    if (process.env.NODE_ENV === 'development') {
      if (!config) {
        console.error(
          '[Operate] Operate.Parent 必须在 createOperate 创建的组件内使用。',
        );
      }
    }

    // ── 合并配置：Parent props > createOperate ──
    const mergedTouchType = touchType ?? config?.touchType ?? 'button';
    const mergedValueType = config?.valueType ?? 'Key';
    const mergedMultiple = multiple ?? config?.multiple ?? false;
    const mergedTitleModal = titleModal ?? config?.titleModal;
    const mergedPlaceholder = config?.placeholder;

    // ── 开发环境校验（合并后） ──
    if (process.env.NODE_ENV === 'development') {
      validateValueType(mergedValueType, 'Operate.Parent');
      validateMultipleValueType(mergedMultiple, mergedValueType, 'Operate.Parent');
      if (config?.fieldNames) {
        validateFieldNamesForSelect(
          mergedTouchType,
          config.fieldNames,
          'Operate.Parent',
        );
      }
    }

    // ── Modal 状态 ──
    const [visible, setVisible] = useState(false);
    const [activeItem, setActiveItem] = useState<ItemModalData | null>(null);
    const [currentFooter, setCurrentFooter] = useState<React.ReactNode>(null);
    const [currentTitle, setCurrentTitle] = useState<React.ReactNode>(mergedTitleModal);

    const titleRef = useRef(mergedTitleModal);
    titleRef.current = mergedTitleModal;

    const openModal = useCallback((itemData: ItemModalData) => {
      setActiveItem(itemData);
      setCurrentTitle(itemData.titleModal ?? titleRef.current);
      setCurrentFooter(null);
      setVisible(true);
    }, []);

    const closeModal = useCallback(() => {
      setVisible(false);
      setActiveItem(null);
      setCurrentFooter(null);
      setCurrentTitle(titleRef.current);
    }, []);

    const setFooter = useCallback((footer: React.ReactNode) => {
      setCurrentFooter(footer);
    }, []);

    // ── Content 组件的 props ──
    const contentProps = useMemo(
      () => ({
        open: visible,
        closeModal,
        multiple: mergedMultiple,
        setFooter,
        disabled: activeItem?.disabled ?? false,
        onChange: (value: any, options: any) => {
          activeItem?.onChange?.(value, options);
        },
        params: activeItem?.params,
      }),
      [visible, closeModal, mergedMultiple, setFooter, activeItem],
    );

    const Content = config?.content;

    // ── Parent 上下文 ──
    const contextValue: OperateParentContextValue = useMemo(
      () => ({
        openModal,
        mergedTouchType,
        mergedValueType,
        mergedMultiple,
        mergedTitleModal,
        mergedPlaceholder,
        fieldNames: config!.fieldNames,
      }),
      [
        openModal,
        mergedTouchType,
        mergedValueType,
        mergedMultiple,
        mergedTitleModal,
        mergedPlaceholder,
        config,
      ],
    );

    return (
      <OperateParentContext.Provider value={contextValue}>
        {children}
        {Content && (
          <Modal
            title={currentTitle}
            open={visible}
            onCancel={closeModal}
            footer={currentFooter}
            destroyOnHidden
            {...activeItem?.modalProps}
          >
            <Content {...contentProps} />
          </Modal>
        )}
      </OperateParentContext.Provider>
    );
  };
}
