// webpack.config.js

const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

const isDevMode = process.env.NODE_ENV !== 'production';

const publicPath = './';

module.exports = {
  devtool: 'source-map',
  entry: './src/index.js',
  resolve: {
    extensions: ['.js'],
  },
  output: {
    filename: 'betomat.js',
    path: path.resolve(__dirname, 'build'),
    publicPath: publicPath,
    clean: true,
    library: {
      name: 'Betomat',
      type: 'umd',
    },
  },
  externals: /^@ckeditor\/.+$/i,
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                sourceMap: true,
                sourceMapContents: false
              },
            },
          },
        ],
      },
      {
        test: /\.svg$/i,
        type: 'asset/source',
      },
    ]
  },
  optimization: {
    minimizer: [
      `...`,
      new CssMinimizerPlugin(),
    ],
  },
  plugins: [
    new CssMinimizerPlugin(),
    new MiniCssExtractPlugin({
      filename: 'betomat.css',
    }),
  ],
};
