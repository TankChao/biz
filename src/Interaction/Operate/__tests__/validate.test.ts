import {
  validateValueType,
  validateMultipleValueType,
  validateFieldNamesForSelect,
  validateConfig,
} from '../validate';

describe('Operate validate', () => {
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  describe('validateValueType', () => {
    it('合法的 valueType 不应报错', () => {
      const validTypes = ['Key', 'Item', 'Key[]', 'Item[]'];
      validTypes.forEach((vt) => {
        validateValueType(vt, 'test');
      });
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('非法的 valueType 应报错', () => {
      validateValueType('Invalid', 'test');
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid'),
      );
    });
  });

  describe('validateMultipleValueType', () => {
    it('多选 + 数组类型 不应报错', () => {
      validateMultipleValueType(true, 'Key[]', 'test');
      validateMultipleValueType(true, 'Item[]', 'test');
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('多选 + 非数组类型 应报错', () => {
      validateMultipleValueType(true, 'Key', 'test');
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Key'),
      );
    });

    it('单选 + 任意类型 不应报错', () => {
      validateMultipleValueType(false, 'Key', 'test');
      validateMultipleValueType(false, 'Item', 'test');
      expect(errorSpy).not.toHaveBeenCalled();
    });
  });

  describe('validateFieldNamesForSelect', () => {
    it('touchType 为 button 时不应校验 fieldNames', () => {
      validateFieldNamesForSelect('button', { label: '', value: '' }, 'test');
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('touchType 为 select 且 fieldNames 完整时不应报错', () => {
      validateFieldNamesForSelect('select', { label: 'name', value: 'id' }, 'test');
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('touchType 为 select 且缺少 label 时应报错', () => {
      validateFieldNamesForSelect('select', { label: '', value: 'id' }, 'test');
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('fieldNames.label'),
      );
    });

    it('touchType 为 select 且缺少 value 时应报错', () => {
      validateFieldNamesForSelect('select', { label: 'name', value: '' }, 'test');
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('fieldNames.value'),
      );
    });
  });

  describe('validateConfig', () => {
    const validConfig = {
      content: (() => null) as any,
      fieldNames: { label: 'name', value: 'id' },
    };

    it('合法配置不应报错', () => {
      validateConfig(validConfig);
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('缺少 content 应报错', () => {
      validateConfig({ ...validConfig, content: undefined as any });
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('content'),
      );
    });

    it('缺少 fieldNames 应报错', () => {
      validateConfig({ ...validConfig, fieldNames: undefined as any });
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('fieldNames'),
      );
    });

    it('非法的 valueType 应报错', () => {
      validateConfig({ ...validConfig, valueType: 'BadType' as any });
      expect(errorSpy).toHaveBeenCalled();
    });

    it('多选 + 非数组 valueType 应报错', () => {
      validateConfig({ ...validConfig, multiple: true, valueType: 'Key' });
      expect(errorSpy).toHaveBeenCalled();
    });
  });
});
