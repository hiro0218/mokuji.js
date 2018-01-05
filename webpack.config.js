var webpack = require('webpack');
var package = require('./package.json');

var copyright = `${package.name} v${package.version}
${package.homepage}

Copyright (C) 2017-2018 ${package.author}`;

var config = {
  module: {
    rules: [{
      test: /\.js$/,
      use: ['babel-loader'],
      exclude: /node_modules/
    }]
  },
  output: {
    library: 'Mokuji',
    libraryTarget: 'umd'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }),
    new webpack.BannerPlugin(copyright),
    new webpack.optimize.ModuleConcatenationPlugin(),
  ]
};

if (process.env.NODE_ENV === 'production') {
  config.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        screw_ie8: false,
        warnings: false
      }
    }),
    new webpack.optimize.AggressiveMergingPlugin(),
  );
}

module.exports = config;
