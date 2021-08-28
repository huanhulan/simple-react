import typescript from '@rollup/plugin-typescript';
import { join } from 'path';

export default {
  input: join(__dirname, './index.ts'),
  output: {
    format: 'es',
    file: './dist/index.js',
  },
  plugins: [typescript({ tsconfig: join(__dirname, './tsconfig.json') })],
};
