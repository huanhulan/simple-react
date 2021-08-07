import { resolve, join } from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
// load modules whose location is specified in the paths section of tsconfig.json when using webpack
import TSConfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
// Easily exclude node modules in Webpack
import NodeExternals from 'webpack-node-externals';

export default function webpackConfig() {
  return {
    externals: [
      NodeExternals({
        allowlist: [/^my-react/],
        additionalModuleDirs: [join(__dirname, '../../node_modules')],
      }),
    ],
    mode: 'development',
    entry: './src/index.ts',
    devtool: 'eval',
    devServer: {
      open: true,
      historyApiFallback: true,
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
      extensions: ['.ts', '.tsx', '.jsx', '...'], // !important
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
  };
}
