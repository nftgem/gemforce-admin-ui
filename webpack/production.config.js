/*
 * Copyright (c) 2016-present, Parse, LLC
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
var configuration = require('./base.config.js');

configuration.mode = 'production';
configuration.entry = {
  dashboard: './dashboard/index.js',
  login: './login/index.js',
  PIG: './parse-interface-guide/index.js',
  quickstart: './quickstart/index.js',
};
configuration.output.path = require('path').resolve('./production/bundles');
configuration.resolve = {
  extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.css', '.scss'],
  modules: ['src', 'node_modules'] // Assuming that your files are inside the src dir
}

module.exports = configuration;
