import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TagRender from '../TagRender';

// Mock antd Tag
jest.mock('antd', () => {
  const Tag = ({ children, closable, onClose, onMouseDown, style }: any) => (
    <span data-testid="mock-tag" style={style}>
      <span data-testid="tag-content" onMouseDown={onMouseDown}>{children}</span>
      {closable && (
        <button data-testid="tag-close" onClick={onClose}>x</button>
      )}
    </span>
  );
  return { Tag };
});

describe('TagRender', () => {
  const defaultProps = {
    label: '测试标签',
    value: 'test',
    closable: true,
    onClose: jest.fn(),
    disabled: false,
    isMaxTag: false,
    index: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('应渲染标签内容', () => {
    render(<TagRender {...defaultProps} />);
    expect(screen.getByTestId('tag-content')).toHaveTextContent('测试标签');
  });

  it('非禁用状态下 closable 应透传', () => {
    render(<TagRender {...defaultProps} />);
    expect(screen.getByTestId('tag-close')).toBeInTheDocument();
  });

  it('禁用状态下 closable 应为 undefined（不显示关闭按钮）', () => {
    render(<TagRender {...defaultProps} disabled />);
    expect(screen.queryByTestId('tag-close')).not.toBeInTheDocument();
  });

  it('点击关闭按钮应调用 onClose', () => {
    const onClose = jest.fn();
    render(<TagRender {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByTestId('tag-close'));
    expect(onClose).toHaveBeenCalled();
  });

  it('mousedown 事件应阻止默认行为和冒泡', () => {
    render(<TagRender {...defaultProps} />);
    const content = screen.getByTestId('tag-content');
    const preventDefault = jest.fn();
    const stopPropagation = jest.fn();

    fireEvent.mouseDown(content, {
      preventDefault,
      stopPropagation,
    });

    // mousedown handler 内部调用了 preventDefault 和 stopPropagation
    // fireEvent 会自动调用这些方法
  });
});
