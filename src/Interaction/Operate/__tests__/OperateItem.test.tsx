import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { createOperateItem } from '../createOperateItem';
import { OperateConfigContext, OperateParentContext } from '../context';
import type { OperateConfigContextValue, OperateParentContextValue } from '../context';
import type { FieldNames } from '../types';

const OperateItem = createOperateItem(OperateConfigContext, OperateParentContext);

// ── Mock antd ──
jest.mock('antd', () => {
  const Button = ({ children, onClick, disabled, ...rest }: any) => (
    <button data-testid="operate-button" onClick={onClick} disabled={disabled} {...rest}>
      {children}
    </button>
  );

  const Select = (props: any) => {
    const {
      value, options, onChange, onOpenChange, mode,
      disabled, placeholder, allowClear, open, tagRender, ...rest
    } = props;
    return (
      <div
        data-testid="operate-select"
        data-value={JSON.stringify(value)}
        data-mode={mode}
        data-disabled={String(!!disabled)}
        data-placeholder={placeholder}
        data-allow-clear={String(!!allowClear)}
      >
        <button
          data-testid="select-trigger"
          onClick={() => onOpenChange?.(true)}
        >
          open
        </button>
        {options?.map((opt: any) => (
          <div key={String(opt.value)} data-testid={`option-${opt.value}`}>
            {opt.label}
          </div>
        ))}
        {tagRender && (
          <div data-testid="tag-render-slot">
            {tagRender({
              label: 'tag-label',
              value: 'tag-value',
              closable: true,
              onClose: jest.fn(),
              onSelect: jest.fn(),
              disabled: disabled,
            })}
          </div>
        )}
        <button
          data-testid="select-onchange"
          onClick={() => onChange?.(['a', 'b'])}
        >
          trigger-onChange
        </button>
        <button
          data-testid="select-onchange-single"
          onClick={() => onChange?.(undefined)}
        >
          trigger-clear
        </button>
      </div>
    );
  };

  return { Button, Select };
});

// ── Mock TagRender ──
jest.mock('../TagRender', () => ({
  __esModule: true,
  default: (props: any) => (
    <span data-testid="mock-tag-render" data-disabled={String(!!props.disabled)}>
      {props.label}
    </span>
  ),
}));

// ── Helper: 构建默认 fieldNames ──
const defaultFieldNames: FieldNames = { label: 'name', value: 'id' };

const richFieldNames: FieldNames = {
  label: 'name',
  value: 'id',
  labelRich: (item: any) => <span data-testid="rich-label">{item?.name}-rich</span>,
};

// ── Helper: 包装 ConfigContext ──
function renderWithConfig(
  ui: React.ReactElement,
  configValue: Partial<OperateConfigContextValue> = {},
  parentValue: OperateParentContextValue | null = null,
) {
  const fullConfig: OperateConfigContextValue = {
    content: () => <div />,
    fieldNames: defaultFieldNames,
    ...configValue,
  };

  let element = (
    <OperateConfigContext.Provider value={fullConfig}>
      {parentValue !== null ? (
        <OperateParentContext.Provider value={parentValue}>
          {ui}
        </OperateParentContext.Provider>
      ) : (
        ui
      )}
    </OperateConfigContext.Provider>
  );

  return render(element);
}

// 构建 parent context 的 helper
function makeParentCtx(overrides: Partial<OperateParentContextValue> = {}): OperateParentContextValue {
  return {
    openModal: jest.fn(),
    mergedTouchType: 'button',
    mergedValueType: 'Key',
    mergedMultiple: false,
    fieldNames: defaultFieldNames,
    ...overrides,
  };
}

// ══════════════════════════════════════════════════
// 测试开始
// ══════════════════════════════════════════════════

describe('OperateItem', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ──────────────────────────────────────────────
  // Lines 18-24: getLabel / getValue
  // ──────────────────────────────────────────────
  describe('getLabel / getValue (lines 18-24)', () => {
    it('应使用 fieldNames.label 读取 label', () => {
      renderWithConfig(
        <OperateItem value={{ id: 1, name: 'Alice' }} />,
        { touchType: 'select', valueType: 'Item', fieldNames: defaultFieldNames },
      );
      expect(screen.getByTestId('option-1')).toHaveTextContent('Alice');
    });

    it('应优先使用 labelRich 渲染 label', () => {
      renderWithConfig(
        <OperateItem value={{ id: 1, name: 'Alice' }} />,
        { touchType: 'select', valueType: 'Item', fieldNames: richFieldNames },
      );
      expect(screen.getByTestId('rich-label')).toHaveTextContent('Alice-rich');
    });

    it('item 为 null/undefined 时 label 应为空字符串', () => {
      renderWithConfig(
        <OperateItem value={null} />,
        { touchType: 'select', valueType: 'Item', fieldNames: defaultFieldNames },
      );
      expect(screen.getByTestId('operate-select')).not.toHaveAttribute('data-value');
    });

    it('getValue 应通过 fieldNames.value 读取 value', () => {
      renderWithConfig(
        <OperateItem value={{ id: 42, name: 'Bob' }} />,
        { touchType: 'select', valueType: 'Item', fieldNames: defaultFieldNames },
      );
      expect(screen.getByTestId('operate-select')).toHaveAttribute('data-value', '42');
    });
  });

  // ──────────────────────────────────────────────
  // Lines 36-45: computeSelectValue
  // ──────────────────────────────────────────────
  describe('computeSelectValue (lines 36-45)', () => {
    it('valueType=Item 时应返回 item[fieldNames.value]', () => {
      renderWithConfig(
        <OperateItem value={{ id: 10, name: 'X' }} />,
        { touchType: 'select', valueType: 'Item', fieldNames: defaultFieldNames },
      );
      expect(screen.getByTestId('operate-select')).toHaveAttribute('data-value', '10');
    });

    it('valueType=Item[] 时应返回 key 数组', () => {
      renderWithConfig(
        <OperateItem
          value={[
            { id: 1, name: 'A' },
            { id: 2, name: 'B' },
          ]}
        />,
        { touchType: 'select', valueType: 'Item[]', multiple: true, fieldNames: defaultFieldNames },
      );
      expect(screen.getByTestId('operate-select')).toHaveAttribute('data-value', '[1,2]');
    });

    it('valueType=Item[] 且 value 非数组时应返回空数组', () => {
      renderWithConfig(
        <OperateItem value="not-array" />,
        { touchType: 'select', valueType: 'Item[]', multiple: true, fieldNames: defaultFieldNames },
      );
      expect(screen.getByTestId('operate-select')).toHaveAttribute('data-value', '[]');
    });

    it('valueType=Key 时应直接返回 value', () => {
      renderWithConfig(
        <OperateItem value="key-1" />,
        { touchType: 'select', valueType: 'Key', fieldNames: defaultFieldNames },
      );
      expect(screen.getByTestId('operate-select')).toHaveAttribute('data-value', '"key-1"');
    });

    it('valueType=Key[] 时应直接返回 value 数组', () => {
      renderWithConfig(
        <OperateItem value={['k1', 'k2']} />,
        { touchType: 'select', valueType: 'Key[]', multiple: true, fieldNames: defaultFieldNames },
      );
      expect(screen.getByTestId('operate-select')).toHaveAttribute('data-value', '["k1","k2"]');
    });

    it('value=null 且非多选时应返回 undefined', () => {
      renderWithConfig(
        <OperateItem value={null} />,
        { touchType: 'select', valueType: 'Key', fieldNames: defaultFieldNames },
      );
      expect(screen.getByTestId('operate-select')).not.toHaveAttribute('data-value');
    });

    it('value=null 且多选时应返回空数组', () => {
      renderWithConfig(
        <OperateItem value={null} />,
        { touchType: 'select', valueType: 'Key[]', multiple: true, fieldNames: defaultFieldNames },
      );
      expect(screen.getByTestId('operate-select')).toHaveAttribute('data-value', '[]');
    });
  });

  // ──────────────────────────────────────────────
  // Lines 57-64: computeSelectOptions (Item/Item[])
  // ──────────────────────────────────────────────
  describe('computeSelectOptions for Item/Item[] (lines 57-64)', () => {
    it('单选 Item 时应从 value 构建单个 option', () => {
      renderWithConfig(
        <OperateItem value={{ id: 5, name: 'E' }} />,
        { touchType: 'select', valueType: 'Item', fieldNames: defaultFieldNames },
      );
      expect(screen.getByTestId('option-5')).toHaveTextContent('E');
    });

    it('多选 Item[] 时应从 value 数组构建多个 options', () => {
      renderWithConfig(
        <OperateItem
          value={[
            { id: 1, name: 'A' },
            { id: 2, name: 'B' },
            { id: 3, name: 'C' },
          ]}
        />,
        { touchType: 'select', valueType: 'Item[]', multiple: true, fieldNames: defaultFieldNames },
      );
      expect(screen.getByTestId('option-1')).toHaveTextContent('A');
      expect(screen.getByTestId('option-2')).toHaveTextContent('B');
      expect(screen.getByTestId('option-3')).toHaveTextContent('C');
    });

    it('多选但 value 非数组时 options 应为空', () => {
      const { container } = renderWithConfig(
        <OperateItem value="bad" />,
        { touchType: 'select', valueType: 'Item[]', multiple: true, fieldNames: defaultFieldNames },
      );
      expect(container.querySelectorAll('[data-testid^="option-"]')).toHaveLength(0);
    });

    it('单选 Item 且 value=null 时 options 应为空', () => {
      const { container } = renderWithConfig(
        <OperateItem value={null} />,
        { touchType: 'select', valueType: 'Item', fieldNames: defaultFieldNames },
      );
      expect(container.querySelectorAll('[data-testid^="option-"]')).toHaveLength(0);
    });
  });

  // ──────────────────────────────────────────────
  // Line 72: computeSelectOptions (Key/Key[] with defaultOptions)
  // ──────────────────────────────────────────────
  describe('computeSelectOptions for Key/Key[] (line 72)', () => {
    it('Key 类型时应从 defaultOptions 构建 options', () => {
      renderWithConfig(
        <OperateItem
          value="a"
          defaultOptions={[
            { id: 'a', name: 'Alpha' },
            { id: 'b', name: 'Beta' },
          ]}
        />,
        { touchType: 'select', valueType: 'Key', fieldNames: defaultFieldNames },
      );
      expect(screen.getByTestId('option-a')).toHaveTextContent('Alpha');
      expect(screen.getByTestId('option-b')).toHaveTextContent('Beta');
    });

    it('Key[] 类型时应从 defaultOptions 构建 options', () => {
      renderWithConfig(
        <OperateItem
          value={['a']}
          defaultOptions={[
            { id: 'a', name: 'Alpha' },
            { id: 'b', name: 'Beta' },
          ]}
        />,
        { touchType: 'select', valueType: 'Key[]', multiple: true, fieldNames: defaultFieldNames },
      );
      expect(screen.getByTestId('option-a')).toHaveTextContent('Alpha');
      expect(screen.getByTestId('option-b')).toHaveTextContent('Beta');
    });

    it('Key 类型且无 defaultOptions 时 options 应为空', () => {
      const { container } = renderWithConfig(
        <OperateItem value="a" />,
        { touchType: 'select', valueType: 'Key', fieldNames: defaultFieldNames },
      );
      expect(container.querySelectorAll('[data-testid^="option-"]')).toHaveLength(0);
    });

    it('Key 类型且 defaultOptions 为空数组时 options 应为空', () => {
      const { container } = renderWithConfig(
        <OperateItem value="a" defaultOptions={[]} />,
        { touchType: 'select', valueType: 'Key', fieldNames: defaultFieldNames },
      );
      expect(container.querySelectorAll('[data-testid^="option-"]')).toHaveLength(0);
    });
  });

  // ──────────────────────────────────────────────
  // Lines 116-119: 开发环境校验
  // ──────────────────────────────────────────────
  describe('开发环境校验 (lines 116-119)', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('valueType 不合法时应输出 console.error', () => {
      process.env.NODE_ENV = 'development';
      renderWithConfig(
        <OperateItem />,
        { valueType: 'Invalid' as any },
      );
      expect(console.error).toHaveBeenCalled();
    });

    it('多选时 valueType 非数组类型应输出 console.error', () => {
      process.env.NODE_ENV = 'development';
      renderWithConfig(
        <OperateItem />,
        { valueType: 'Key', multiple: true },
      );
      expect(console.error).toHaveBeenCalled();
    });

    it('select 模式下 fieldNames 缺少 label 应输出 console.error', () => {
      process.env.NODE_ENV = 'development';
      renderWithConfig(
        <OperateItem />,
        {
          touchType: 'select',
          fieldNames: { label: '', value: 'id' },
        },
      );
      expect(console.error).toHaveBeenCalled();
    });

    it('select 模式下 fieldNames 缺少 value 应输出 console.error', () => {
      process.env.NODE_ENV = 'development';
      renderWithConfig(
        <OperateItem />,
        {
          touchType: 'select',
          fieldNames: { label: 'name', value: '' },
        },
      );
      expect(console.error).toHaveBeenCalled();
    });
  });

  // ──────────────────────────────────────────────
  // Lines 150-155: select 模式下无 fieldNames
  // ──────────────────────────────────────────────
  describe('select 模式无 fieldNames (lines 150-155)', () => {
    const originalEnv = process.env.NODE_ENV;
    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('fieldNames 未配置时应返回 null 并打印错误', () => {
      process.env.NODE_ENV = 'development';
      const { container } = renderWithConfig(
        <OperateItem />,
        { touchType: 'select', fieldNames: undefined as any },
      );
      expect(container.innerHTML).toBe('');
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('fieldNames'),
      );
    });

    it('非开发环境下 fieldNames 未配置时应返回 null 但不打印错误', () => {
      process.env.NODE_ENV = 'production';
      const { container } = renderWithConfig(
        <OperateItem />,
        { touchType: 'select', fieldNames: undefined as any },
      );
      expect(container.innerHTML).toBe('');
    });
  });

  // ──────────────────────────────────────────────
  // Lines 124-133: handleOpen (disabled + disableOpen)
  // ──────────────────────────────────────────────
  describe('handleOpen (lines 124-133)', () => {
    it('disabled 且 disableOpen=false 时点击 button 不应打开弹窗', () => {
      const parent = makeParentCtx({ mergedTouchType: 'button' });
      renderWithConfig(
        <OperateItem disabled />,
        {},
        parent,
      );
      fireEvent.click(screen.getByTestId('operate-button'));
      expect(parent.openModal).not.toHaveBeenCalled();
    });

    it('disabled 且 disableOpen=true 时点击 button 应打开弹窗', () => {
      const parent = makeParentCtx({ mergedTouchType: 'button' });
      renderWithConfig(
        <OperateItem disabled disableOpen />,
        {},
        parent,
      );
      fireEvent.click(screen.getByTestId('operate-button'));
      expect(parent.openModal).toHaveBeenCalled();
    });

    it('select 模式下点击应通过 onOpenChange 触发 handleOpen', () => {
      const parent = makeParentCtx({ mergedTouchType: 'select' });
      renderWithConfig(
        <OperateItem />,
        {},
        parent,
      );
      fireEvent.click(screen.getByTestId('select-trigger'));
      expect(parent.openModal).toHaveBeenCalledWith(
        expect.objectContaining({ disabled: false }),
      );
    });

    it('handleOpen 应传递正确的 titleModal, params, modalProps', () => {
      const parent = makeParentCtx({ mergedTouchType: 'button' });
      const onChange = jest.fn();
      const modalProps = { width: 800 };
      renderWithConfig(
        <OperateItem
          titleModal="选择项目"
          params={{ foo: 'bar' }}
          onChange={onChange}
          modalProps={modalProps as any}
        />,
        {},
        parent,
      );
      fireEvent.click(screen.getByTestId('operate-button'));
      expect(parent.openModal).toHaveBeenCalledWith({
        titleModal: '选择项目',
        params: { foo: 'bar' },
        onChange,
        disabled: false,
        modalProps,
      });
    });
  });

  // ──────────────────────────────────────────────
  // Lines 169-191: handleSelectChange
  // ──────────────────────────────────────────────
  describe('handleSelectChange (lines 169-191)', () => {
    it('disabled 时 onChange 不应被调用', () => {
      const onChange = jest.fn();
      renderWithConfig(
        <OperateItem disabled disableOpen value={['a']} onChange={onChange} />,
        { touchType: 'select', valueType: 'Key[]', multiple: true, fieldNames: defaultFieldNames },
      );
      fireEvent.click(screen.getByTestId('select-onchange'));
      expect(onChange).not.toHaveBeenCalled();
    });

    it('多选 Item[] 移除标签时应保留剩余 items', () => {
      const onChange = jest.fn();
      const items = [
        { id: 'a', name: 'A' },
        { id: 'b', name: 'B' },
        { id: 'c', name: 'C' },
      ];
      renderWithConfig(
        <OperateItem value={items} onChange={onChange} />,
        { touchType: 'select', valueType: 'Item[]', multiple: true, fieldNames: defaultFieldNames },
      );
      // mock 的 select-onchange 触发 onChange(['a', 'b']) → 移除了 id='c'
      fireEvent.click(screen.getByTestId('select-onchange'));
      expect(onChange).toHaveBeenCalledWith(
        [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }],
        [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }],
      );
    });

    it('多选 Key[] 移除标签时应返回剩余 keys 和对应的 defaultOptions', () => {
      const onChange = jest.fn();
      const defaults = [
        { id: 'a', name: 'Alpha' },
        { id: 'b', name: 'Beta' },
        { id: 'c', name: 'Gamma' },
      ];
      renderWithConfig(
        <OperateItem value={['a', 'b', 'c']} onChange={onChange} defaultOptions={defaults} />,
        { touchType: 'select', valueType: 'Key[]', multiple: true, fieldNames: defaultFieldNames },
      );
      fireEvent.click(screen.getByTestId('select-onchange'));
      expect(onChange).toHaveBeenCalledWith(
        ['a', 'b'],
        [{ id: 'a', name: 'Alpha' }, { id: 'b', name: 'Beta' }],
      );
    });

    it('单选 Item 清除时应调用 onChange(undefined, [])', () => {
      const onChange = jest.fn();
      renderWithConfig(
        <OperateItem value={{ id: 'a', name: 'A' }} onChange={onChange} />,
        { touchType: 'select', valueType: 'Item', fieldNames: defaultFieldNames },
      );
      fireEvent.click(screen.getByTestId('select-onchange-single'));
      expect(onChange).toHaveBeenCalledWith(undefined, []);
    });

    it('单选 Key 清除时应调用 onChange(undefined, [])', () => {
      const onChange = jest.fn();
      renderWithConfig(
        <OperateItem value="key-1" onChange={onChange} />,
        { touchType: 'select', valueType: 'Key', fieldNames: defaultFieldNames },
      );
      fireEvent.click(screen.getByTestId('select-onchange-single'));
      expect(onChange).toHaveBeenCalledWith(undefined, []);
    });

    it('多选 Item[] 且 value 非数组时应传空数组', () => {
      const onChange = jest.fn();
      renderWithConfig(
        <OperateItem value="not-array" onChange={onChange} />,
        { touchType: 'select', valueType: 'Item[]', multiple: true, fieldNames: defaultFieldNames },
      );
      fireEvent.click(screen.getByTestId('select-onchange'));
      expect(onChange).toHaveBeenCalledWith([], []);
    });

    it('多选 Key[] 且 defaultOptions 为 undefined 时应传空数组', () => {
      const onChange = jest.fn();
      renderWithConfig(
        <OperateItem value={['a']} onChange={onChange} />,
        { touchType: 'select', valueType: 'Key[]', multiple: true, fieldNames: defaultFieldNames },
      );
      fireEvent.click(screen.getByTestId('select-onchange'));
      expect(onChange).toHaveBeenCalledWith(['a', 'b'], []);
    });
  });

  // ──────────────────────────────────────────────
  // Line 210: tagRender 传递 disabled
  // ──────────────────────────────────────────────
  describe('tagRender (line 210)', () => {
    it('应将 disabled 传递给 TagRender', () => {
      renderWithConfig(
        <OperateItem value={[{ id: 'a', name: 'A' }]} disabled disableOpen />,
        { touchType: 'select', valueType: 'Item[]', multiple: true, fieldNames: defaultFieldNames },
      );
      const tag = screen.getByTestId('mock-tag-render');
      expect(tag).toHaveAttribute('data-disabled', 'true');
    });

    it('非 disabled 时 TagRender 的 disabled 应为 false', () => {
      renderWithConfig(
        <OperateItem value={[{ id: 'a', name: 'A' }]} />,
        { touchType: 'select', valueType: 'Item[]', multiple: true, fieldNames: defaultFieldNames },
      );
      const tag = screen.getByTestId('mock-tag-render');
      expect(tag).toHaveAttribute('data-disabled', 'false');
    });
  });

  // ──────────────────────────────────────────────
  // Select 渲染属性 (lines 150-155 补充)
  // ──────────────────────────────────────────────
  describe('Select 渲染属性', () => {
    it('应正确传递 placeholder', () => {
      renderWithConfig(
        <OperateItem placeholder="请选择" />,
        { touchType: 'select', valueType: 'Key', fieldNames: defaultFieldNames },
      );
      expect(screen.getByTestId('operate-select')).toHaveAttribute('data-placeholder', '请选择');
    });

    it('多选时 mode 应为 multiple', () => {
      renderWithConfig(
        <OperateItem />,
        { touchType: 'select', valueType: 'Key[]', multiple: true, fieldNames: defaultFieldNames },
      );
      expect(screen.getByTestId('operate-select')).toHaveAttribute('data-mode', 'multiple');
    });

    it('disabled 时 allowClear 应为 false', () => {
      renderWithConfig(
        <OperateItem disabled disableOpen />,
        { touchType: 'select', valueType: 'Key', fieldNames: defaultFieldNames },
      );
      expect(screen.getByTestId('operate-select')).toHaveAttribute('data-allow-clear', 'false');
    });

    it('非 disabled 时 allowClear 应为 true', () => {
      renderWithConfig(
        <OperateItem />,
        { touchType: 'select', valueType: 'Key', fieldNames: defaultFieldNames },
      );
      expect(screen.getByTestId('operate-select')).toHaveAttribute('data-allow-clear', 'true');
    });

    it('disabled 且 disableOpen=false 时 Select 应被禁用', () => {
      renderWithConfig(
        <OperateItem disabled disableOpen={false} />,
        { touchType: 'select', valueType: 'Key', fieldNames: defaultFieldNames },
      );
      expect(screen.getByTestId('operate-select')).toHaveAttribute('data-disabled', 'true');
    });
  });
});
