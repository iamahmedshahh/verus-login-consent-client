const webpack = require('webpack');
const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const jsSourcePath = path.join(__dirname, './src');
const buildPath = path.join(__dirname, './build');
const imgPath = path.join(__dirname, './src/assets/img');
const wwwPath = path.join(__dirname, './www');

module.exports = (_, argv) => {
  const mode = argv.mode || 'development';
  const isProduction = mode === 'production';

  // Common plugins
  const plugins = [
    new webpack.DefinePlugin({}),
    new HtmlWebpackPlugin({
      template: path.join(wwwPath, 'index.html'),
      path: buildPath,
      filename: 'index.html',
    }),
    new MiniCssExtractPlugin({
      filename: 'style.css',
    }),
    new webpack.ProvidePlugin({
      React: 'react',
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser.js',
      Buffer: ['buffer', 'Buffer'],
    }),
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        configFile: path.resolve(__dirname, 'tsconfig.json'),
      },
      async: true,
    }),
  ];

  // Common rules
  const rules = [
    {
      test: /\.(ts|tsx|js|jsx)$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
        },
      },
    },
    {
      test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      use: [
        {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'application/font-woff',
          },
        },
      ],
    },
    {
      test: /\.(ttf|eot|svg|png)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: 'file-loader',
    },
    {
      test: /\.(png|gif|jpg|svg)$/,
      include: imgPath,
      use: 'url-loader?limit=20480&name=assets/[name].[ext]',
    },
  ];

  if (isProduction) {
    // Production plugins
    plugins.push(
      new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: false,
      })
    );

    // Production rules
    rules.push({
      test: /\.(sa|sc|c)ss$/,
      use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
    });
  } else {
    // Development rules
    rules.push({
      exclude: /node_modules/,
      test: /\.(sa|sc|c)ss$/,
      use: ['style-loader', 'css-loader', 'sass-loader?sourceMap'],
    });
  }

  return {
    mode,
    devtool: isProduction ? 'source-map' : 'eval',
    context: jsSourcePath,
    entry: {
      js: ['core-js/stable', 'regenerator-runtime/runtime', './index.js'],
    },
    output: {
      path: buildPath,
      filename: 'app.js',
    },
    module: {
      rules,
    },
    resolve: {
      fallback: {
        buffer: require.resolve('buffer'),
        stream: require.resolve('stream-browserify'),
        crypto: require.resolve('crypto-browserify'),
        util: require.resolve('util'),
        assert: require.resolve('assert'),
        vm: require.resolve('vm-browserify'),
      },
      extensions: [
        '.ts',
        '.tsx',
        '.js',
        '.jsx',
        '.json',
        '.webpack-loader.js',
        '.web-loader.js',
        '.loader.js',
      ],
      modules: [path.resolve(__dirname, 'node_modules'), 'node_modules', jsSourcePath],
      alias: {
        '#': path.resolve(__dirname, 'src'),
      },
    },
    plugins,
    devServer: {
      port: 3001,
      static: {
        directory: isProduction ? './build' : './src',
      },
      client: {
        overlay: true,
      },
    },
    optimization: {
      moduleIds: 'named',
      chunkIds: 'named',
      emitOnErrors: true,
      minimize: isProduction,
      minimizer: [new TerserPlugin()],
    },
    stats: {
      children: false,
      colors: true,
      modules: false,
      entrypoints: false,
      chunks: false,
    },
  };
};
