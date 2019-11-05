const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyPlugin = require('copy-webpack-plugin');

module.exports = env => {
  console.log(env.NODE_ENV);
  return {
    mode: env.NODE_ENV,
    entry: "./src/index.ts",
    devtool: "inline-source-map",
    devServer: {
      contentBase: "./src/public",
      watchContentBase: true,
      hot: true
    },
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: "./src/public/index.html",
        filename: "./index.html"
      }),
      new CopyPlugin([
        { from: 'src/data', to: 'data'},
        { from: 'src/public/css', to: 'css'},
        { from: 'src/public/images', to: 'images'}
      ])
    ],
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"]
        },
        {
          test: /\.(png|svg|jpg|gif)$/,
          use: ["file-loader"]
        }
      ]
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"]
    },
    output: {
      filename: "main.js",
      path: path.resolve(__dirname, "docs")
    }
  };
};
