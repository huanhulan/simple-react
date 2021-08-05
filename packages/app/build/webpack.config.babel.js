import { resolve, join } from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import TSConfigPathsPlugin  from 'tsconfig-paths-webpack-plugin';
import NodeExternals  from 'webpack-node-externals';

export default function (env, argv) {
  return {
    externals: [
      NodeExternals({
        allowlist: [/^my-react/],
        additionalModuleDirs: ['../../node_modules'],
      }),
    ],
    mode: env.production ? 'production' : 'development',
    entry: './src/index.ts',
    devtool: env.production ? 'source-map' : 'eval',
    devServer: {
      open: true,
      historyApiFallback: true
    },
    output: {
      path: resolve(__dirname, 'dist'),
      filename: 'bundle.js',
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: './src/index.html',
      }),
    ],
    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
      plugins: [new TSConfigPathsPlugin()],
    },
    module: {
      rules: [
        {
          test: /\\.j|ts(x)?$/,
          exclude: /node_modules/,
          use: ['babel-loader'],
        },
      ],
    },
  }
}
