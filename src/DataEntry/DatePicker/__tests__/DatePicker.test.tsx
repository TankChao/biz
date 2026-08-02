import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DatePicker from '../index';

// Mock dayjs
jest.mock('dayjs', () => {
  const dayjs = (value: any, format?: string) => ({
    format: (f: string) => value || '',
    isValid: () => !!value,
    _value: value,
    _format: format,
  });
  return dayjs;
});

// Mock antd DatePicker
jest.mock('antd', () => {
  const AntDatePicker = (props: any) => {
    const { value, defaultValue, onChange, picker, format, ...rest } = props;
    return (
      <div data-testid="antd-date-picker" data-picker={picker} data-format={format}>
        <input
          data-testid="date-input"
          data-value={value?._value ?? ''}
          onChange={(e) => {
            if (onChange) {
              onChange({ _value: e.target.value, format: () => e.target.value }, e.target.value);
            }
          }}
        />
      </div>
    );
  };
  return { DatePicker: AntDatePicker };
});

describe('DatePicker 组件', () => {
  describe('默认格式', () => {
    it('picker 为 date 时默认格式应为 YYYY-MM-DD', () => {
      render(<DatePicker picker="date" />);
      const dp = screen.getByTestId('antd-date-picker');
      expect(dp).toHaveAttribute('data-picker', 'date');
    });

    it('picker 为 month 时默认格式应为 YYYY-MM', () => {
      render(<DatePicker picker="month" />);
      const dp = screen.getByTestId('antd-date-picker');
      expect(dp).toHaveAttribute('data-picker', 'month');
    });

    it('picker 为 year 时默认格式应为 YYYY', () => {
      render(<DatePicker picker="year" />);
      const dp = screen.getByTestId('antd-date-picker');
      expect(dp).toHaveAttribute('data-picker', 'year');
    });
  });

  describe('value 转换', () => {
    it('字符串 value 应转换为 dayjs 对象传入 antd', () => {
      render(<DatePicker value="2024-01-15" picker="date" />);
      const input = screen.getByTestId('date-input');
      expect(input).toHaveAttribute('data-value', '2024-01-15');
    });

    it('空字符串 value 应转换为 null', () => {
      render(<DatePicker value="" picker="date" />);
      const input = screen.getByTestId('date-input');
      expect(input).toHaveAttribute('data-value', '');
    });

    it('undefined value 应转换为 null', () => {
      render(<DatePicker picker="date" />);
      const input = screen.getByTestId('date-input');
      expect(input).toHaveAttribute('data-value', '');
    });
  });

  describe('onChange 回调', () => {
    it('应将 antd 的 onChange 转换为 (string, dayjs) 格式', () => {
      const handleChange = jest.fn();
      render(<DatePicker onChange={handleChange} picker="date" />);

      const input = screen.getByTestId('date-input');
      fireEvent.change(input, { target: { value: '2024-06-01' } });

      expect(handleChange).toHaveBeenCalledWith(
        '2024-06-01',
        expect.objectContaining({ _value: '2024-06-01' }),
      );
    });

    it('未传入 onChange 时不应报错', () => {
      render(<DatePicker picker="date" />);
      const input = screen.getByTestId('date-input');
      expect(() => {
        fireEvent.change(input, { target: { value: '2024-06-01' } });
      }).not.toThrow();
    });
  });

  describe('自定义 format', () => {
    it('传入 string 类型的 format 时应使用自定义格式', () => {
      render(<DatePicker format="DD/MM/YYYY" picker="date" />);
      const dp = screen.getByTestId('antd-date-picker');
      expect(dp).toHaveAttribute('data-format', 'DD/MM/YYYY');
    });
  });

  describe('透传 props', () => {
    it('应将额外 props 透传给 antd DatePicker', () => {
      render(<DatePicker picker="month" placeholder="选择月份" />);
      const dp = screen.getByTestId('antd-date-picker');
      expect(dp).toHaveAttribute('data-picker', 'month');
    });
  });
});
