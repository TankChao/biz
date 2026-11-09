import type { OperateConfig } from './types';

const VALID_VALUE_TYPES = ['Key', 'Item', 'Key[]', 'Item[]'] as const;

/** 校验 valueType 是否合法 */
export function validateValueType(valueType: string, source: string): void {
  if (!(VALID_VALUE_TYPES as readonly string[]).includes(valueType)) {
    console.error(
      `[Operate] ${source}: valueType "${valueType}" 不合法，必须是 'Key' | 'Item' | 'Key[]' | 'Item[]' 之一。`,
    );
  }
}

/** 校验多选时 valueType 必须是数组类型 */
export function validateMultipleValueType(
  multiple: boolean,
  valueType: string,
  source: string,
): void {
  if (multiple && valueType !== 'Key[]' && valueType !== 'Item[]') {
    console.error(
      `[Operate] ${source}: 多选模式下 valueType 必须是 'Key[]' 或 'Item[]'，当前为 "${valueType}"。`,
    );
  }
}

/** 校验 select 触发器时 fieldNames 必须有 label 和 value */
export function validateFieldNamesForSelect(
  touchType: string,
  fieldNames: { label?: string; value?: string },
  source: string,
): void {
  if (touchType === 'select') {
    if (!fieldNames.label) {
      console.error(
        `[Operate] ${source}: touchType 为 'select' 时，fieldNames.label 必须有值。`,
      );
    }
    if (!fieldNames.value) {
      console.error(
        `[Operate] ${source}: touchType 为 'select' 时，fieldNames.value 必须有值。`,
      );
    }
  }
}

/** 校验 createOperate 的配置 */
export function validateConfig(config: OperateConfig): void {
  if (!config.content) {
    console.error('[Operate] createOperate: content 必须提供。');
  }
  if (!config.fieldNames) {
    console.error('[Operate] createOperate: fieldNames 必须提供。');
  }
  const vt = config.valueType ?? 'Key';
  const ml = config.multiple ?? false;
  const tt = config.touchType ?? 'button';

  validateValueType(vt, 'createOperate');
  validateMultipleValueType(ml, vt, 'createOperate');
  if (config.fieldNames) {
    validateFieldNamesForSelect(tt, config.fieldNames, 'createOperate');
  }
}
