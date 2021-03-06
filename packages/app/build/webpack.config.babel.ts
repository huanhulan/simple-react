import HtmlWebpackPlugin from 'html-webpack-plugin';
import { exec } from 'child_process';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import path from 'path';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import { env, argv } from 'process';
import { Configuration } from 'webpack';

export default async function webpackConfig() {
  let author: string;
  let link: string;

  try {
    const gitConfig: string = await new Promise((rs, rj) =>
      exec('git config -l', (err, stdout) => {
        if (err) {
          rj(err);
          return;
        }
        rs(stdout);
      }),
    );
    const configs = gitConfig
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => !!s);

    // eslint-disable-next-line prefer-destructuring
    link = configs
      .map((config) => /^remote\.origin\.url=(.+)$/.exec(config))
      .filter((s) => !!s)[0][1];

    // eslint-disable-next-line prefer-destructuring
    author = configs
      .map((config) => /^user\.name=(.+)$/.exec(config))
      .filter((s) => !!s)[0][1];
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }
  const prod = 'production';
  const mode = argv[argv.length - 1] === prod ? prod : 'development';

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
        charset: 'UTF-8',
        link,
        author,
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
        },
        {
          test: /\.css$/i,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
      ],
    },
    ...(mode === prod && {
      optimization: {
        minimize: true,
        minimizer: ['...', new CssMinimizerPlugin()],
      },
    }),
    mode,
  } as Configuration;
}
