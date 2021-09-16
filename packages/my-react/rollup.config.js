import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { join } from 'path';
import { argv } from 'process';
import minimist from 'minimist';

const esm = 'es';

const { format = esm } = minimist(argv);

export default {
  input: join(__dirname, './index.ts'),
  output: {
    format,
    file: `./dist/index.${format === esm ? 'esm' : format}.js`,
    ...(format !== esm && { name: 'MyReact', exports: 'named' }),
  },
  plugins: [
    typescript({
      tsconfig: join(__dirname, './tsconfig.json'),
      outputToFilesystem: false,
    }),
    nodeResolve(),
  ],
};
