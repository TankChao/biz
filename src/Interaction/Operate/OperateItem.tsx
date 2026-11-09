import React, { useCallback, useContext } from 'react';
import type { Context } from 'react';
import { Button, Select } from 'antd';
import TagRender from './TagRender';
import type {
  OperateConfigContextValue,
  OperateParentContextValue,
} from './context';
import type { OperateItemProps, ValueType, FieldNames } from './types';
import {
  validateValueType,
  validateMultipleValueType,
  validateFieldNamesForSelect,
} from './validate';

// ──────────────────────────────────────────────
// 工具函数
// ──────────────────────────────────────────────

/** 通过 fieldNames 读取 label（优先使用 labelRich） */
function getLabel(item: any, fieldNames: FieldNames): React.ReactNode {
  if (fieldNames.labelRich) return fieldNames.labelRich(item);
  return item?.[fieldNames.label] ?? '';
}

/** 通过 fieldNames 读取 value */
function getValue(item: any, fieldNames: FieldNames): any {
  return item?.[fieldNames.value];
}

/** 将 Form value 转换为 Select 可识别的 value */
function computeSelectValue(
  value: any,
  valueType: ValueType,
  multiple: boolean,
  fieldNames: FieldNames,
): any {
  if (value === null) return multiple ? [] : undefined;

  if (valueType === 'Item') {
    return getValue(value, fieldNames);
  }
  if (valueType === 'Item[]') {
    return Array.isArray(value)
      ? value.map((item) => getValue(item, fieldNames))
      : [];
  }
  // Key / Key[] — value 已经是 key(s)
  return value;
}

/** 构建 Select 的 options */
function computeSelectOptions(
  value: any,
  defaultOptions: any[] | undefined,
  valueType: ValueType,
  multiple: boolean,
  fieldNames: FieldNames,
): { label: React.ReactNode; value: any }[] {
  if (valueType === 'Item' || valueType === 'Item[]') {
    const items = multiple
      ? Array.isArray(value)
        ? value
        : []
      : value
        ? [value]
        : [];
    return items.map((item) => ({
      label: getLabel(item, fieldNames),
      value: getValue(item, fieldNames),
    }));
  }

  // Key / Key[] — 从 defaultOptions 构建
  if (defaultOptions?.length) {
    return defaultOptions.map((item) => ({
      label: getLabel(item, fieldNames),
      value: getValue(item, fieldNames),
    }));
  }

  return [];
}

// ──────────────────────────────────────────────
// OperateItem 主组件
// ──────────────────────────────────────────────

/**
 * 创建 Operate.Item 组件。
 *
 * 传入属于同一配置的一对 Context，使不同 setOperateConfig 生成的组件
 * 拥有完全独立的上下文，互不串扰。
 */
export function createOperateItem(
  OperateConfigContext: Context<OperateConfigContextValue | null>,
  OperateParentContext: Context<OperateParentContextValue | null>,
) {
  return function OperateItem(props: OperateItemProps) {
    const parentCtx = useContext(OperateParentContext);
    const configCtx = useContext(OperateConfigContext);

    const {
      disabled = false,
      disableOpen = false,
      children,
      value,
      onChange,
      titleModal,
      placeholder,
      params,
      buttonProps,
      selectProps,
      modalProps,
      defaultOptions,
    } = props;

    // ── 合并配置：Item > Parent > setOperateConfig ──
    const touchType =
      parentCtx?.mergedTouchType ?? configCtx?.touchType ?? 'button';
    const valueType =
      parentCtx?.mergedValueType ?? configCtx?.valueType ?? 'Key';
    const multiple = parentCtx?.mergedMultiple ?? configCtx?.multiple ?? false;
    const mergedPlaceholder =
      placeholder ?? parentCtx?.mergedPlaceholder ?? configCtx?.placeholder;
    const fieldNames = parentCtx?.fieldNames ?? configCtx?.fieldNames;

    // ── 开发环境校验 ──
    if (process.env.NODE_ENV === 'development') {
      validateValueType(valueType, 'Operate.Item');
      validateMultipleValueType(multiple, valueType, 'Operate.Item');
      if (fieldNames) {
        validateFieldNamesForSelect(touchType, fieldNames, 'Operate.Item');
      }
    }

    // ── 打开弹窗 ──
    const handleOpen = useCallback(() => {
      if (disabled && !disableOpen) return;
      parentCtx?.openModal({
        titleModal,
        params,
        onChange,
        disabled: disabled,
        modalProps: modalProps as Record<string, any>,
      });
    }, [disabled, disableOpen, parentCtx, titleModal, params, onChange, modalProps]);

    // ──────────────────────────────────────────────
    // Button 触发器
    // ──────────────────────────────────────────────
    if (touchType === 'button') {
      return (
        <Button disabled={disabled && !disableOpen} {...buttonProps} onClick={handleOpen}>
          {children ?? '操作'}
        </Button>
      );
    }

    // ──────────────────────────────────────────────
    // Select 触发器
    // ──────────────────────────────────────────────
    if (!fieldNames) {
      if (process.env.NODE_ENV === 'development') {
        console.error(
          '[Operate.Item] fieldNames 未配置，请通过 setOperateConfig 设置 fieldNames。',
        );
      }
      return null;
    }

    const selectValue = computeSelectValue(value, valueType, multiple, fieldNames);
    const selectOptions = computeSelectOptions(
      value,
      defaultOptions,
      valueType,
      multiple,
      fieldNames,
    );

    /** Select onChange —— 仅在标签移除 / 清除时触发 */
    const handleSelectChange = (newSelectValue: any) => {
      if (!fieldNames || disabled) return;
      if (multiple) {
        const keys = Array.isArray(newSelectValue) ? newSelectValue : [];

        if (valueType === 'Item[]') {
          const remainingItems = (Array.isArray(value) ? value : []).filter(
            (item: any) => keys.includes(getValue(item, fieldNames)),
          );
          onChange?.(remainingItems, remainingItems);
        } else {
          // Key[]
          const remainingItems = (defaultOptions ?? []).filter((item: any) =>
            keys.includes(getValue(item, fieldNames)),
          );
          onChange?.(keys, remainingItems);
        }
      } else {
        // 单选清除
        if (valueType === 'Item') {
          onChange?.(undefined, []);
        } else {
          onChange?.(undefined, []);
        }
      }
    };

    return (
      <Select
        {...selectProps}
        allowClear={!disabled}
        open={false}
        onOpenChange={(open) => {
          if (open) handleOpen();
        }}
        disabled={disabled && !disableOpen}
        mode={multiple ? 'multiple' : undefined}
        value={selectValue}
        options={selectOptions}
        placeholder={mergedPlaceholder}
        onChange={handleSelectChange}
        tagRender={(p) => <TagRender {...p} disabled={disabled} />}
      />
    );
  };
}
