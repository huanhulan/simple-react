import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { join } from 'path';

export default {
  input: join(__dirname, './index.ts'),
  output: {
    format: 'es',
    file: './dist/index.js',
  },
  plugins: [
    typescript({
      tsconfig: join(__dirname, './tsconfig.json'),
      outputToFilesystem: false,
    }),
    nodeResolve(),
  ],
};
