import { defineConfig } from 'father';

export default defineConfig({
  cjs: { output: 'dist/cjs' },
  esm: { output: 'dist/esm' },
  umd: {
    output: 'dist/umd',
    externals: { react: 'React', 'react-dom': 'ReactDOM' },
    name: 'kachinaBiz',
  },
});
