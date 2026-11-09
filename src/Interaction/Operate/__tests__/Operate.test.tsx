import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import createOperate from '../createOperate';
import type { ContentProps } from '../types';

// Mock antd 组件
jest.mock('antd', () => {
  const Button = ({ children, onClick, disabled, ...rest }: any) => (
    <button data-testid="operate-button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );

  const Select = (props: any) => {
    const { value, options, onChange, onOpenChange, mode, disabled, placeholder, allowClear, open, tagRender } = props;
    return (
      <div
        data-testid="operate-select"
        data-value={JSON.stringify(value)}
        data-mode={mode}
        data-disabled={disabled}
        data-placeholder={placeholder}
      >
        <button
          data-testid="select-trigger"
          onClick={() => onOpenChange?.(true)}
        >
          open
        </button>
        {options?.map((opt: any) => (
          <div key={opt.value} data-testid={`select-option-${opt.value}`}>
            {opt.label}
          </div>
        ))}
      </div>
    );
  };

  const Modal = ({ children, open, title, onCancel, footer }: any) => (
    <div data-testid="operate-modal" data-open={open} data-title={title}>
      <button data-testid="modal-close" onClick={onCancel}>close</button>
      {footer && <div data-testid="modal-footer">{footer}</div>}
      {open && children}
    </div>
  );

  const Tag = ({ children, closable, onClose, onMouseDown }: any) => (
    <span data-testid="operate-tag" data-closable={closable}>
      <span data-testid="tag-content" onMouseDown={onMouseDown}>{children}</span>
      {closable && <button data-testid="tag-close" onClick={onClose}>x</button>}
    </span>
  );

  return { Button, Select, Modal, Tag };
});

// 模拟 Content 组件
const MockContent: React.FC<ContentProps> = ({ open, closeModal, setFooter, onChange }) => (
  <div data-testid="mock-content" data-open={open}>
    <button data-testid="content-confirm" onClick={() => { onChange?.('selected', [{ label: 'Test', value: 'selected' }]); closeModal(); }}>
      确认
    </button>
    <button data-testid="content-set-footer" onClick={() => setFooter(<div>Custom Footer</div>)}>
      Set Footer
    </button>
  </div>
);

describe('Operate 组件', () => {
  describe('createOperate', () => {
    it('应返回带有 Parent 和 Item 属性的配置化组件', () => {
      const ConfiguredOperate = createOperate({
        content: MockContent,
        fieldNames: { label: 'label', value: 'value' },
      });

      expect(ConfiguredOperate).toBeDefined();
      expect(ConfiguredOperate.Parent).toBeDefined();
      expect(ConfiguredOperate.Item).toBeDefined();
    });
  });

  describe('Operate 便捷组件 - button 模式', () => {
    const ConfiguredOperate = createOperate({
      content: MockContent,
      fieldNames: { label: 'label', value: 'value' },
    });

    it('默认应渲染 button 触发器', () => {
      render(<ConfiguredOperate />);
      expect(screen.getByTestId('operate-button')).toBeInTheDocument();
    });

    it('点击 button 应打开弹窗', () => {
      render(<ConfiguredOperate />);
      fireEvent.click(screen.getByTestId('operate-button'));
      expect(screen.getByTestId('operate-modal')).toHaveAttribute('data-open', 'true');
    });

    it('弹窗中应渲染 Content 组件', () => {
      render(<ConfiguredOperate />);
      fireEvent.click(screen.getByTestId('operate-button'));
      expect(screen.getByTestId('mock-content')).toBeInTheDocument();
    });

    it('disabled 时 button 应被禁用', () => {
      render(<ConfiguredOperate disabled />);
      expect(screen.getByTestId('operate-button')).toBeDisabled();
    });

    it('disableOpen + disabled 时 button 仍可点击', () => {
      render(<ConfiguredOperate disabled disableOpen />);
      const button = screen.getByTestId('operate-button');
      expect(button).not.toBeDisabled();
    });

    it('自定义 children 应作为 button 文本', () => {
      render(<ConfiguredOperate>自定义文本</ConfiguredOperate>);
      expect(screen.getByTestId('operate-button').textContent).toBe('自定义文本');
    });

    it('默认 button 文本应为"操作"', () => {
      render(<ConfiguredOperate />);
      expect(screen.getByTestId('operate-button').textContent).toBe('操作');
    });
  });

  describe('Operate.Parent + Operate.Item 组合', () => {
    const ConfiguredOperate = createOperate({
      content: MockContent,
      fieldNames: { label: 'label', value: 'value' },
    });

    it('应支持 Parent/Item 组合使用', () => {
      render(
        <ConfiguredOperate.Parent>
          <ConfiguredOperate.Item>编辑</ConfiguredOperate.Item>
        </ConfiguredOperate.Parent>,
      );
      expect(screen.getByTestId('operate-button')).toBeInTheDocument();
      expect(screen.getByTestId('operate-button').textContent).toBe('编辑');
    });

    it('Parent 的 titleModal 应传递给弹窗', () => {
      render(
        <ConfiguredOperate.Parent titleModal="选择项目">
          <ConfiguredOperate.Item />
        </ConfiguredOperate.Parent>,
      );
      fireEvent.click(screen.getByTestId('operate-button'));
      expect(screen.getByTestId('operate-modal')).toHaveAttribute('data-title', '选择项目');
    });
  });

  describe('多个配置化组件相互隔离', () => {
    const ContentA: React.FC<ContentProps> = ({ params }) => (
      <div data-testid="content-a">{params?.label}</div>
    );
    const ContentB: React.FC<ContentProps> = ({ params }) => (
      <div data-testid="content-b">{params?.label}</div>
    );

    const OperateA = createOperate({
      content: ContentA,
      fieldNames: { label: 'label', value: 'value' },
    });
    const OperateB = createOperate({
      content: ContentB,
      fieldNames: { label: 'label', value: 'value' },
    });

    it('不同配置的 Item 应绑定各自的配置，互不串扰', () => {
      render(
        <OperateA.Parent titleModal="A 弹窗">
          <OperateA.Item>A 按钮</OperateA.Item>
          <OperateB.Item>B 按钮</OperateB.Item>
        </OperateA.Parent>,
      );

      // B 按钮应打开 B 配置的弹窗，而不是 A 的
      fireEvent.click(screen.getByText('B 按钮'));
      expect(screen.getByTestId('content-b')).toBeInTheDocument();
      expect(screen.queryByTestId('content-a')).not.toBeInTheDocument();

      // A 按钮仍应打开 A 配置的弹窗
      fireEvent.click(screen.getByText('A 按钮'));
      expect(screen.getByTestId('content-a')).toBeInTheDocument();
    });

    it('同一配置下的多个 Item 应共享同一个 Parent 弹窗', () => {
      render(
        <OperateA.Parent titleModal="A 弹窗">
          <OperateA.Item>A1 按钮</OperateA.Item>
          <OperateA.Item>A2 按钮</OperateA.Item>
        </OperateA.Parent>,
      );

      fireEvent.click(screen.getByText('A1 按钮'));
      fireEvent.click(screen.getByText('A2 按钮'));
      expect(screen.getAllByTestId('operate-modal')).toHaveLength(1);
      expect(screen.getByTestId('content-a')).toBeInTheDocument();
    });
  });
  describe('Operate.Item - select 模式', () => {
    const ConfiguredOperate = createOperate({
      content: MockContent,
      fieldNames: { label: 'name', value: 'id' },
      touchType: 'select',
    });

    it('touchType 为 select 时应渲染 Select 组件', () => {
      render(<ConfiguredOperate touchType="select" />);
      expect(screen.getByTestId('operate-select')).toBeInTheDocument();
    });

    it('Select 模式下点击应打开弹窗', () => {
      render(<ConfiguredOperate touchType="select" />);
      fireEvent.click(screen.getByTestId('select-trigger'));
      expect(screen.getByTestId('operate-modal')).toHaveAttribute('data-open', 'true');
    });
  });

  describe('弹窗交互', () => {
    const ConfiguredOperate = createOperate({
      content: MockContent,
      fieldNames: { label: 'label', value: 'value' },
    });

    it('关闭弹窗后 Content 应不可见', () => {
      const onChange = jest.fn();
      render(<ConfiguredOperate onChange={onChange} />);

      // 打开弹窗
      fireEvent.click(screen.getByTestId('operate-button'));
      expect(screen.getByTestId('operate-modal')).toHaveAttribute('data-open', 'true');

      // 关闭弹窗
      fireEvent.click(screen.getByTestId('modal-close'));
      expect(screen.getByTestId('operate-modal')).toHaveAttribute('data-open', 'false');
    });

    it('Content 中调用 setFooter 应更新弹窗 footer', () => {
      render(<ConfiguredOperate />);
      fireEvent.click(screen.getByTestId('operate-button'));
      fireEvent.click(screen.getByTestId('content-set-footer'));
      expect(screen.getByTestId('modal-footer')).toBeInTheDocument();
    });

    it('Content 中调用 onChange 应触发外部 onChange', () => {
      const onChange = jest.fn();
      render(<ConfiguredOperate onChange={onChange} />);
      fireEvent.click(screen.getByTestId('operate-button'));
      fireEvent.click(screen.getByTestId('content-confirm'));
      expect(onChange).toHaveBeenCalledWith('selected', [{ label: 'Test', value: 'selected' }]);
    });
  });
});
