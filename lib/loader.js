"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = _default;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _async = _interopRequireDefault(require("async"));

var _loaderUtils = _interopRequireDefault(require("loader-utils"));

var _processResources = _interopRequireDefault(require("./utils/processResources"));

var _parseResources = _interopRequireDefault(require("./utils/parseResources"));

var _rewriteImports = _interopRequireDefault(require("./utils/rewriteImports"));

var _logger = _interopRequireDefault(require("./utils/logger"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/* eslint func-names: 0 */
function _default(source) {
  var webpack = this;
  if (webpack.cacheable) webpack.cacheable();
  var callback = webpack.async(); // eslint-disable-next-line no-underscore-dangle

  global.__DEBUG__ = process.env.DEBUG === 'sass-resources-loader' || process.env.DEBUG === '*';

  _logger["default"].debug('Hey, we\'re in DEBUG mode! Yabba dabba doo!');

  var resourcesFromConfig = (_loaderUtils["default"].getOptions(this) || {}).resources;

  if (!resourcesFromConfig) {
    var error = new Error('Can\'t find sass resources in your config. Make sure loader.options.resources exists');
    return callback(error);
  }

  var resourcesLocations = (0, _parseResources["default"])(resourcesFromConfig);
  var moduleContext = webpack.context;
  var webpackConfigContext = webpack.rootContext || webpack.options && webpack.options.context || process.cwd();

  if (!webpack.rootContext && !webpack.options && !webpack.options.context) {
    _logger["default"].debug('`options.context` is missing. Using current working directory as a root instead:', process.cwd());
  }

  _logger["default"].debug('Module context:', moduleContext);

  _logger["default"].debug('Webpack config context:', webpackConfigContext);

  _logger["default"].debug('Resources:', resourcesLocations);

  if (!resourcesLocations.length) {
    var _error = new Error("\n      Something wrong with provided resources.\n      Make sure 'options.resources' is String or Array of Strings.\n    ");

    return callback(_error);
  }

  var files = resourcesLocations.map(function (resource) {
    var file = _path["default"].resolve(webpackConfigContext, resource);

    webpack.addDependency(file);
    return file;
  });

  _async["default"].map(files, function (file, cb) {
    try {
      var contents = _fs["default"].readFileSync(file, 'utf8');

      (0, _rewriteImports["default"])(null, file, contents, moduleContext, cb);
    } catch (error) {
      (0, _rewriteImports["default"])(error, file, null, moduleContext, cb);
    }
  }, function (error, resources) {
    (0, _processResources["default"])(error, resources, source, moduleContext, callback);
  });

  return undefined;
}