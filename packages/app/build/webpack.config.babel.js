import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import path from 'path';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import { env, argv } from 'process';

export default function webpackConfig() {
  return {
    entry: {
      index: './src/index.tsx',
    },
    devtool: 'source-map',
    devServer: {
      open: false,
      historyApiFallback: true,
      port: env.port || 8080,
      ...(env.host && {
        host: env.host,
      }),
    },
    output: {
      filename: '[name].[contenthash:8].js',
      path: path.join(__dirname, '../dist'),
      publicPath: '/',
      clean: true,
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: './src/index.html',
        meta: {
          viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no',
        },
        title: 'TodoMVC',
      }),
      new MiniCssExtractPlugin(),
    ],
    resolve: {
      extensions: ['.ts', '.tsx', '.jsx', '...'], // !important
    },
    module: {
      rules: [
        {
          test: /\.j|ts(x)?$/,
          use: ['babel-loader'],
          exclude: [/core-js/],
        },
        {
          test: /\.css$/i,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
      ],
    },
    optimization: {
      minimize: true,
      minimizer: ['...', new CssMinimizerPlugin()],
    },
    mode: argv[argv.length - 1] === 'production' ? 'production' : 'development',
  };
}
