/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',

  // Transform ES modules from node_modules for Ant Design packages
  transformIgnorePatterns: [
    'node_modules/(?!(@ant-design|antd)/)',
  ],

  // ?? src ????????????
  roots: ['<rootDir>/src'],

  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': [
      require.resolve('ts-jest'),
      {
        tsconfig: {
          jsx: 'react-jsx',
          module: 'commonjs',
          moduleResolution: 'node',
          esModuleInterop: true,
          strict: true,
          target: 'ES2020',
          allowJs: true,
        },
      },
    ],
  },
  moduleNameMapper: {
    '\\.(css|less)$': 'identity-obj-proxy',
  },

  // ??? src ????????
  testMatch: ['<rootDir>/src/**/__tests__/**/*.test.{ts,tsx}'],

  // ---- Coverage Configuration ----
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.md',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/OperateDemo/**',
    '!src/**/index.ts',
    '!src/typings.d.ts',
  ],
  coverageReporters: ['text', 'text-summary', 'html', 'lcov'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};