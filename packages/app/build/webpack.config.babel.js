import HtmlWebpackPlugin from 'html-webpack-plugin';

import path from 'path';

/**
 * @returns {webpack.Configuration}
 */
module.exports = function webpackConfig() {
  return {
    mode: 'development',
    entry: {
      index: './src/index.tsx',
    },
    devtool: 'inline-source-map',
    devServer: {
      open: false,
      historyApiFallback: true,
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
};
