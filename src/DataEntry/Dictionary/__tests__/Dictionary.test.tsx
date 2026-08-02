import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { setDictionaryConfig } from '../hoc';
import DictionaryInner from '../index';
import type { DictionaryOption, DictionaryService } from '../cache';

// Mock antd Select
jest.mock('antd', () => {
  const Select = (props: any) => {
    const { options, loading, value, children, ...rest } = props;
    if (props['data-testid']) {
      return (
        <div data-testid={props['data-testid']} data-loading={loading} data-value={JSON.stringify(value)}>
          {options?.map((opt: any) => (
            <div key={opt.value} data-testid={`option-${opt.value}`}>
              {opt.label}
            </div>
          ))}
          {children}
        </div>
      );
    }
    return (
      <div data-testid="antd-select" data-loading={loading} data-value={JSON.stringify(value)}>
        {options?.map((opt: any) => (
          <div key={opt.value} data-testid={`option-${opt.value}`}>
            {opt.label}
          </div>
        ))}
        {children}
      </div>
    );
  };
  return { Select };
});

describe('Dictionary HOC - setDictionaryConfig', () => {
  const mockOptions: DictionaryOption[] = [
    { label: '启用', value: 1 },
    { label: '禁用', value: 0 },
  ];

  const mockService: DictionaryService = jest.fn().mockResolvedValue({
    status: mockOptions,
  });

  it('应该通过 HOC 注入 config 并正确渲染', async () => {
    const ConfiguredDictionary = setDictionaryConfig('test-dict', mockService, 50)(DictionaryInner);

    await act(async () => {
      render(<ConfiguredDictionary params={{ name: 'status' }} />);
    });

    // 等待数据加载
    await waitFor(() => {
      expect(screen.getByTestId('option-1')).toBeInTheDocument();
    });
  });

  it('应该传递额外的 props 给 Dictionary 组件', async () => {
    const ConfiguredDictionary = setDictionaryConfig('test-dict-2', mockService, 50)(DictionaryInner);

    await act(async () => {
      render(
        <ConfiguredDictionary
          params={{ name: 'status' }}
          placeholder="请选择"
          data-testid="my-select"
        />,
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('my-select')).toBeInTheDocument();
    });
  });
});

describe('Dictionary 组件', () => {
  const mockOptions: DictionaryOption[] = [
    { label: '启用', value: 1 },
    { label: '禁用', value: 0 },
  ];

  const mockService: DictionaryService = jest.fn().mockResolvedValue({
    status: mockOptions,
  });

  const ConfiguredDictionary = setDictionaryConfig('test-comp', mockService, 50)(DictionaryInner);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('未配置 context 时应输出错误', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    render(<DictionaryInner params={{ name: 'status' }} />);
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('setConfig'),
    );
    errorSpy.mockRestore();
  });

  it('应该在加载完成后显示 options', async () => {
    await act(async () => {
      render(<ConfiguredDictionary params={{ name: 'status' }} />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('option-1')).toBeInTheDocument();
      expect(screen.getByTestId('option-0')).toBeInTheDocument();
    });
  });

  it('children 为函数时，应使用 render prop 模式', async () => {
    const renderFn = jest.fn().mockReturnValue(<div data-testid="render-prop-child">render</div>);

    await act(async () => {
      render(
        <ConfiguredDictionary params={{ name: 'status' }}>
          {renderFn}
        </ConfiguredDictionary>,
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('render-prop-child')).toBeInTheDocument();
    });

    expect(renderFn).toHaveBeenCalledWith(
      expect.objectContaining({
        options: mockOptions,
      }),
    );
  });

  it('value 变化时 label 应正确匹配', async () => {
    await act(async () => {
      render(
        <ConfiguredDictionary params={{ name: 'status' }} value={1}>
          {(props: any) => <div data-testid="label">{props.label}</div>}
        </ConfiguredDictionary>,
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('label').textContent).toBe('启用');
    });
  });

  it('数组 value 时 label 应以逗号分隔', async () => {
    await act(async () => {
      render(
        <ConfiguredDictionary params={{ name: 'status' }} value={[1, 0]}>
          {(props: any) => <div data-testid="label">{props.label}</div>}
        </ConfiguredDictionary>,
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('label').textContent).toBe('启用, 禁用');
    });
  });
});

describe('Dictionary display 展示模式', () => {
  const mockOptions: DictionaryOption[] = [
    { label: '启用', value: 1 },
    { label: '禁用', value: 0 },
  ];

  const mockService: DictionaryService = jest.fn().mockResolvedValue({
    status: mockOptions,
  });

  const ConfiguredDictionary = setDictionaryConfig('test-display', mockService, 50)(DictionaryInner);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('display 默认值为 select，应渲染 Select', async () => {
    await act(async () => {
      render(<ConfiguredDictionary params={{ name: 'status' }} />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('antd-select')).toBeInTheDocument();
    });
  });

  it('display="select" 时应渲染 Select', async () => {
    await act(async () => {
      render(<ConfiguredDictionary params={{ name: 'status' }} display="select" />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('antd-select')).toBeInTheDocument();
    });
  });

  it('display="text" 时应渲染 span 而不是 Select', async () => {
    await act(async () => {
      render(
        <ConfiguredDictionary
          params={{ name: 'status' }}
          value={1}
          display="text"
          data-testid="text-mode"
        />,
      );
    });

    await waitFor(() => {
      // 不应渲染 Select
      expect(screen.queryByTestId('antd-select')).not.toBeInTheDocument();
      // 应该渲染匹配到的 label 文本
      expect(screen.getByText('启用')).toBeInTheDocument();
    });
  });

  it('display="text" 且 value 为数组时，应展示逗号分隔的 label', async () => {
    await act(async () => {
      render(
        <ConfiguredDictionary
          params={{ name: 'status' }}
          value={[1, 0]}
          display="text"
        />,
      );
    });

    await waitFor(() => {
      expect(screen.getByText('启用, 禁用')).toBeInTheDocument();
    });
  });

  it('display="text" 且 value 未匹配到 option 时，应展示原始 value', async () => {
    await act(async () => {
      render(
        <ConfiguredDictionary
          params={{ name: 'status' }}
          value={999}
          display="text"
        />,
      );
    });

    await waitFor(() => {
      expect(screen.getByText('999')).toBeInTheDocument();
    });
  });

  it('display="text" 且 value 为 null 时，应展示空内容', async () => {
    await act(async () => {
      render(
        <ConfiguredDictionary
          params={{ name: 'status' }}
          value={null}
          display="text"
        />,
      );
    });

    await waitFor(() => {
      // 应该渲染 span 但内容为空
      expect(screen.queryByTestId('antd-select')).not.toBeInTheDocument();
    });
  });

  it('display="text" 时 textStyle 应应用到 span 上', async () => {
    const customStyle = { color: 'red', fontWeight: 'bold', fontSize: '16px' };

    await act(async () => {
      render(
        <ConfiguredDictionary
          params={{ name: 'status' }}
          value={1}
          display="text"
          textStyle={customStyle}
          data-testid="styled-text"
        />,
      );
    });

    await waitFor(() => {
      const span = screen.getByText('启用');
      expect(span).toBeInTheDocument();
      expect(span.tagName).toBe('SPAN');
      expect(span.style.color).toBe('red');
      expect(span.style.fontWeight).toBe('bold');
      expect(span.style.fontSize).toBe('16px');
    });
  });

  it('display="select" 时 textStyle 不应影响 Select 渲染', async () => {
    await act(async () => {
      render(
        <ConfiguredDictionary
          params={{ name: 'status' }}
          value={1}
          display="select"
          textStyle={{ color: 'red' }}
        />,
      );
    });

    await waitFor(() => {
      // 应该渲染 Select 而不是 span
      expect(screen.getByTestId('antd-select')).toBeInTheDocument();
    });
  });

  it('display="text" 时不应渲染 children', async () => {
    const renderFn = jest.fn().mockReturnValue(<div data-testid="child">child</div>);

    await act(async () => {
      render(
        <ConfiguredDictionary
          params={{ name: 'status' }}
          value={1}
          display="text"
        >
          {renderFn}
        </ConfiguredDictionary>,
      );
    });

    await waitFor(() => {
      // display="text" 应优先于 children 渲染
      expect(screen.queryByTestId('child')).not.toBeInTheDocument();
      expect(screen.getByText('启用')).toBeInTheDocument();
    });
  });
});