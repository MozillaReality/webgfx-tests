const path = require("path");
const pkg = require("./package.json");

module.exports = {
  mode: process.env.NODE_ENV ? "development" : "production",

  entry: {
    // GFXPERFTESTS
    //'gfx-perftests': path.join(__dirname, "src", "client"),
    //'app.bundle': path.join(__dirname, "src", "frontapp"),
    'main': path.join(__dirname, "src", "main")
  },

 output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist")
  },
  module: {
    /*
    rules: [
      {
        test: /.ts$/,
        include: [path.resolve(__dirname, "src"), path.resolve(__dirname, "examples")],
        exclude: [path.resolve(__dirname, "node_modules")],
        loader: "ts-loader"
      }
    ]*/
  },
  //devtool: "inline-source-map",
  resolve: {
    extensions: [".js"]
  },
  devServer: {
    publicPath: "/",
    contentBase: path.join(__dirname, "public")
  }
};