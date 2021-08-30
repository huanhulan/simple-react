import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import path from 'path';
import { env } from 'process';

export default function webpackConfig() {
  return {
    mode: 'development',
    entry: {
      index: './src/index.tsx',
    },
    devtool: 'inline-source-map',
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
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: './src/index.html',
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
      splitChunks: {
        chunks: 'initial',
        minSize: 30000,
        maxAsyncRequests: 3,
      },
    },
  };
}
