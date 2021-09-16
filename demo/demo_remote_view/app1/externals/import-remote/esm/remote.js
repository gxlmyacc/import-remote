"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

require("core-js/modules/es6.object.define-property");

require("core-js/modules/es6.object.define-properties");

require("core-js/modules/es7.object.get-own-property-descriptors");

require("core-js/modules/es6.symbol");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.requireManifest = requireManifest;
exports["default"] = void 0;

require("core-js/modules/es6.regexp.match");

require("core-js/modules/es6.regexp.constructor");

require("core-js/modules/es6.array.some");

require("core-js/modules/es6.array.find");

require("core-js/modules/es6.object.keys");

require("core-js/modules/es6.array.map");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.string.iterator");

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

require("core-js/modules/es6.object.assign");

require("core-js/modules/es6.promise");

require("core-js/modules/es6.object.to-string");

require("regenerator-runtime/runtime");

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

require("core-js/modules/es6.array.is-array");

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

require("core-js/modules/es6.array.for-each");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

require("core-js/modules/es6.string.starts-with");

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

require("core-js/modules/es6.function.name");

require("core-js/modules/es6.regexp.replace");

require("core-js/modules/es6.regexp.split");

require("core-js/modules/es6.array.filter");

require("core-js/modules/es7.array.includes");

require("core-js/modules/es6.string.includes");

var _escapeStringRegexp = _interopRequireDefault(require("escape-string-regexp"));

var _fetch = require("./fetch");

var _utils = require("./utils");

var _runtime2 = _interopRequireDefault(require("./runtime5"));

var _importCss = require("./importCss");

var _requireFactory = require("./requireFactory");

var _semver = require("./semver");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function createContext(context) {
  if (!context) context = {};
  if (!context.window) context.window = window;
  context.__context__ = context;
  return context;
}

function resolvePath(modulePath) {
  if (modulePath.includes('!')) {
    var paths = modulePath.split('!').filter(Boolean);
    modulePath = paths[paths.length - 1] || '';
  }

  return modulePath.split('?')[0];
}

function resolveModulePath(modulePath, nodeModulesPath, currentNodeModulesPath) {
  if (!modulePath) return modulePath;
  nodeModulesPath = resolvePath(nodeModulesPath || '');
  currentNodeModulesPath = resolvePath(currentNodeModulesPath || '');

  if (nodeModulesPath && currentNodeModulesPath !== nodeModulesPath) {
    modulePath = modulePath.replace(currentNodeModulesPath, nodeModulesPath);
  }

  return nodeModulesPath;
}

function resolveModule(external, __require__, nodeModulesPath, currentNodeModulesPath) {
  if (!__require__.m) return;
  if (__require__.m[external.name]) return __require__.m[external.name];
  var modulePath = external.path && resolveModulePath(external.path, nodeModulesPath, currentNodeModulesPath);
  if (modulePath && __require__.m[modulePath]) return __require__(modulePath);
}

function createWindowProxy(windowProxy) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      scopeName = _ref.scopeName,
      host = _ref.host,
      beforeSource = _ref.beforeSource;

  var context = windowProxy.context,
      _windowProxy$document = windowProxy.document,
      doc = _windowProxy$document === void 0 ? {
    html: document.documentElement,
    body: document.body,
    head: document.head
  } : _windowProxy$document,
      windowOthers = (0, _objectWithoutProperties2["default"])(windowProxy, ["context", "document"]);

  var attachIframeLoad = function attachIframeLoad(el) {
    if (!el || el.__import_remote_iframe_load__) return;
    el.addEventListener && el.addEventListener('load', function () {
      try {
        if (el.src && !/^data:/.test(el.src)) return;

        if (el.contentWindow && !el.contentWindow.__windowProxy__) {
          el.contentWindow.__windowProxy__ = {
            doc: {
              html: el.contentDocument,
              body: el.contentDocument.body,
              head: el.contentDocument.head,
              createElement: function createElement() {
                var _el$contentDocument;

                return (_el$contentDocument = el.contentDocument).createElement.apply(_el$contentDocument, arguments);
              },
              getElementById: function getElementById() {
                var _el$contentDocument2;

                return (_el$contentDocument2 = el.contentDocument).getElementById.apply(_el$contentDocument2, arguments);
              }
            }
          };
        }
      } catch (ex) {
        console.error(ex);
      }
    }, true);
    el.__import_remote_iframe_load__ = true;
  };

  doc.getElementById = function getElementByIdProxy(id, scoped) {
    if (scoped === true && !id.startsWith(scopeName)) id = "".concat(scopeName, "-").concat(id);
    return document.getElementById(id);
  };

  doc.createElement = function (tagName, options) {
    var el = document.createElement(tagName, options);
    if (scopeName) el.setAttribute(_utils.ATTR_SCOPE_NAME, scopeName);
    if (el.nodeName === 'IFRAME') attachIframeLoad(el);

    if (!el.appendChild._import_remote_proxy_) {
      var _appendChild = el.appendChild;

      el.appendChild = function appendChildProxy(node, scoped) {
        if (node) {
          if (scoped === true && node.id && !node.id.startsWith(scopeName)) node.id = "".concat(scopeName, "-").concat(node.id);

          if (host && node.nodeName === 'STYLE' && node.getAttribute(_importCss.ATTR_CSS_TRANSFORMED) == null) {
            var text = node.innerText;
            var newText = (0, _importCss.transformStyleHost)(text, host);
            if (beforeSource) newText = beforeSource(text, 'css');
            if (text !== newText) node.innerText = newText;
            node.setAttribute(_importCss.ATTR_CSS_TRANSFORMED, '');
          } else if (node.nodeName === 'IFRAME') attachIframeLoad(el);
        }

        return _appendChild.call(this, node);
      };

      (0, _utils.innumerable)(el.appendChild, '_import_remote_proxy_', true);
    }

    return el;
  };

  return _objectSpread({
    doc: doc,
    globals: {}
  }, windowOthers);
}

function getScopeName(__remoteModuleWebpack__, scopeName, host) {
  var order = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  var newScopeName = "".concat(scopeName).concat(order ? "_".concat(order) : '');
  var currentManifest = __remoteModuleWebpack__.__moduleManifests__[newScopeName];

  if (currentManifest && host && currentManifest.host && !(0, _utils.isSameHost)(currentManifest.host, host)) {
    console.error("[import-remote]warning: [".concat(host, ":").concat(newScopeName, "] scopename alreadly exist, will rename to [").concat(scopeName, "_").concat(order + 1, "]!"));
    return getScopeName(__remoteModuleWebpack__, scopeName, host, ++order);
  }

  return newScopeName;
}

function batchReplace(source, replaces) {
  replaces && replaces.filter(Boolean).forEach(function (_ref2) {
    var _ref3 = (0, _slicedToArray2["default"])(_ref2, 2),
        regx = _ref3[0],
        replace = _ref3[1];

    source = source.replace(regx, replace);
  });
  return source;
}

var splitSourceSize = 102400;

function splitSource(source, splitRegx) {
  var len = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : splitSourceSize;

  var _split = function _split(src) {
    if (src.length <= len) return [src, ''];

    while (src.length > len && !splitRegx.test(src.charAt(len - 1))) {
      len++;
    }

    return [src.substr(0, len), src.substr(len, src.length)];
  };

  var ret = [];
  var restSource = source;

  while (restSource) {
    var _split2 = _split(restSource);

    var _split3 = (0, _slicedToArray2["default"])(_split2, 2);

    source = _split3[0];
    restSource = _split3[1];
    ret.push(source);
  }

  return ret;
}

function resolveResult(result, options) {
  if (options.useEsModuleDefault && result && result.__esModule) result = result["default"];
  return result;
}

function requireModule(__require__, manifest) {
  if (!__require__) return;

  var result = __require__(manifest.entryId, manifest.entryFile);

  if (Array.isArray(manifest.entryId)) result = result[0];
  return result;
}

function requireManifest(url, options) {
  return (0, _fetch.requireJs)(url, options).then(function (manifest) {
    if ((0, _utils.isFunction)(manifest)) {
      var target = manifest(remote, options);

      if (target) {
        if (options.meta) target = target.meta;
        manifest = target && (manifest.iref ? _utils.walkMainifest : function (v) {
          return v;
        })(target);
      }
    }

    return manifest;
  });
}

function remote(url) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  url = (0, _utils.resolveRelativeUrl)(url, {
    host: options.host,
    onHost: function onHost(host) {
      return options.host = host;
    }
  });
  var _options$timeout = options.timeout,
      timeout = _options$timeout === void 0 ? _utils.DEFAULT_TIMEOUT : _options$timeout,
      _options$externals = options.externals,
      externals = _options$externals === void 0 ? {} : _options$externals,
      _options$globals = options.globals,
      globals = _options$globals === void 0 ? {} : _options$globals,
      _options$getManifestC = options.getManifestCallback,
      getManifestCallback = _options$getManifestC === void 0 ? null : _options$getManifestC,
      _options$onRuntimeCha = options.onRuntimeChanged,
      onRuntimeChanged = _options$onRuntimeCha === void 0 ? null : _options$onRuntimeCha,
      _options$host = options.host,
      host = _options$host === void 0 ? (0, _utils.getHostFromUrl)(url) : _options$host,
      _options$sync = options.sync,
      sync = _options$sync === void 0 ? false : _options$sync,
      sourcemapHost = options.sourcemapHost,
      _beforeSource = options.beforeSource,
      method = options.method,
      _options$windowProxy = options.windowProxy,
      windowProxy = _options$windowProxy === void 0 ? {
    document: {
      html: document.documentElement,
      body: document.body,
      head: document.head
    }
  } : _options$windowProxy,
      isCommonModule = options.isCommonModule;

  var __remoteModuleWebpack__ = (0, _fetch.checkRemoteModuleWebpack)(windowProxy.context);

  var cached = windowProxy.context && windowProxy.context.cached || _fetch.globalCached;

  if (cached[url]) {
    return cached[url].result.then( /*#__PURE__*/function () {
      var _ref4 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/regeneratorRuntime.mark(function _callee(r) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.t0 = getManifestCallback;

                if (!_context.t0) {
                  _context.next = 4;
                  break;
                }

                _context.next = 4;
                return getManifestCallback(cached[url].manifest);

              case 4:
                return _context.abrupt("return", resolveResult(r, options));

              case 5:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      return function (_x) {
        return _ref4.apply(this, arguments);
      };
    }());
  }

  cached[url] = {
    manifest: null,
    result: new Promise( /*#__PURE__*/function () {
      var _ref5 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(resolve, _reject) {
        var reject, manifest, scopeName, manifestExternals, commonModuleOptions, commonModules, _moduleManifest, moduleManifest, requireExternal, globalObject, newGlobalObject, libraryTarget, hotUpdateGlobal, hotSourceRegx, jsonpFunction, jsonpSourceRegx, batchReplaces, ctx, context, __require__;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                reject = function reject() {
                  delete cached[url];
                  return _reject.apply(this, arguments);
                };

                _context3.prev = 1;
                _context3.next = 4;
                return requireManifest(url, {
                  timeout: timeout,
                  global: window,
                  nocache: true,
                  sync: sync,
                  cached: cached,
                  method: method
                });

              case 4:
                manifest = _context3.sent;

                if (manifest.scopeName) {
                  _context3.next = 7;
                  break;
                }

                throw new Error('[import-remote:remote]scopeName can not be empty!');

              case 7:
                scopeName = getScopeName(__remoteModuleWebpack__, manifest.scopeName, host);
                if (manifest.scopeName !== scopeName) manifest.scopeName = scopeName;

                if (isCommonModule && typeof isCommonModule === 'string' && isCommonModule !== scopeName) {
                  console.error("[import-remote]warning:commonModule's name(".concat(isCommonModule, ") is not matched the socpeName(").concat(scopeName, ")"));
                }

                cached[url] && (cached[url].manifest = manifest);
                _context3.t0 = getManifestCallback;

                if (!_context3.t0) {
                  _context3.next = 15;
                  break;
                }

                _context3.next = 15;
                return getManifestCallback(manifest);

              case 15:
                // if (__remoteModuleWebpack__[scopeName]) {
                //   const ctx = __remoteModuleWebpack__[scopeName];
                //   const m = requireModule(ctx.require, manifest, true);
                //   if (m) return resolve(m);
                // }
                Object.assign(externals, remote.externals);
                manifestExternals = [].concat((0, _toConsumableArray2["default"])(manifest.externals), (0, _toConsumableArray2["default"])((manifest.shareModules || []).filter(function (v) {
                  return v.shareCommon;
                }))).filter(function (v) {
                  return v && !(v.name in externals) && (!v["var"] || !window[v["var"]]);
                });
                commonModuleOptions = manifest.commonModules || [];

                if (!manifestExternals.length) {
                  _context3.next = 24;
                  break;
                }

                _context3.next = 21;
                return Promise.all(commonModuleOptions.filter(function (m) {
                  return m && m.name && m.url;
                }).map(function (m) {
                  var url = m.url;
                  var mHost = (0, _utils.resolveRelativeUrl)((0, _utils.isFunction)(m.host) ? m.host(options, manifest) : m.host, {
                    host: host
                  });
                  if ((0, _utils.isFunction)(url)) url = url.call(m, options, manifest);
                  url = (0, _utils.resolveRelativeUrl)(url, {
                    host: mHost || host,
                    onHost: m.host ? null : function (host) {
                      if (!m.host) m.host = host;
                    }
                  });
                  return remote(url, {
                    isCommonModule: m.name,
                    externals: externals,
                    globals: globals,
                    host: mHost || (0, _utils.getHostFromUrl)(url),
                    sync: sync,
                    method: method,
                    // getManifestCallback: m.scoped ? getManifestCallback : undefined,
                    windowProxy: m.scoped ? windowProxy : undefined
                  });
                }));

              case 21:
                _context3.t1 = _context3.sent;
                _context3.next = 25;
                break;

              case 24:
                _context3.t1 = [];

              case 25:
                commonModules = _context3.t1;
                _context3.next = 28;
                return Promise.all(commonModules.filter(function (m) {
                  return m;
                }).map( /*#__PURE__*/function () {
                  var _ref6 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(m) {
                    var modules;
                    return regeneratorRuntime.wrap(function _callee2$(_context2) {
                      while (1) {
                        switch (_context2.prev = _context2.next) {
                          case 0:
                            if (m.__esModule) m = m["default"];

                            if ((0, _requireFactory.isRequireFactory)(m)) {
                              _context2.next = 3;
                              break;
                            }

                            return _context2.abrupt("return", m);

                          case 3:
                            _context2.next = 5;
                            return m(manifestExternals);

                          case 5:
                            modules = _context2.sent;

                            if (modules) {
                              Object.keys(modules).forEach(function (key) {
                                var idx = manifestExternals.find(function (v) {
                                  return v.name === key;
                                });
                                if (~idx) manifestExternals.splice(idx, 1);
                              });
                            }

                            return _context2.abrupt("return", modules);

                          case 8:
                          case "end":
                            return _context2.stop();
                        }
                      }
                    }, _callee2);
                  }));

                  return function (_x4) {
                    return _ref6.apply(this, arguments);
                  };
                }()));

              case 28:
                commonModules = _context3.sent.filter(Boolean);

                if (!__remoteModuleWebpack__.__moduleManifests__[scopeName]) {
                  _moduleManifest = __remoteModuleWebpack__.__moduleManifests__[scopeName] = {};
                  _moduleManifest.timestamp = manifest.timestamp;
                  _moduleManifest.host = (0, _utils.joinUrl)(host, '');
                  _moduleManifest.jsChunks = manifest.jsChunks;
                  _moduleManifest.cssChunks = manifest.cssChunks;
                  _moduleManifest.hot = manifest.hot;
                  _moduleManifest.nodeModulesPath = manifest.nodeModulesPath;
                  _moduleManifest.entrys = {};
                }

                moduleManifest = __remoteModuleWebpack__.__moduleManifests__[scopeName];
                manifest.entryFile && (moduleManifest.entrys[manifest.entryFile] = manifest);

                if (!(moduleManifest.timestamp && manifest.timestamp !== moduleManifest.timestamp)) {
                  _context3.next = 38;
                  break;
                }

                console.error("warning:[import-remote:remote][".concat(scopeName, "]the timestamp(").concat(manifest.timestamp, ") of [").concat(url, "] is different with the entry module(").concat(moduleManifest.timestamp, ")!"));
                _context3.t2 = onRuntimeChanged;

                if (!_context3.t2) {
                  _context3.next = 38;
                  break;
                }

                _context3.next = 38;
                return onRuntimeChanged(manifest, moduleManifest);

              case 38:
                requireExternal = function requireExternal(externalOrModuleId, isShare) {
                  var external = externalOrModuleId;
                  if (!(0, _utils.isPlainObject)(external)) external = {
                    name: external
                  };
                  var result = externals[external.name];

                  if (result === undefined) {
                    commonModules.some(function (m) {
                      if ((0, _utils.isFunction)(m)) result = m(external);else result = m[external.name];
                      return result !== undefined;
                    });
                  }

                  if (result === undefined) {
                    commonModuleOptions.some(function (option) {
                      var commonModuleContext = __remoteModuleWebpack__[option.name];
                      var commonModuleManifest = __remoteModuleWebpack__.__moduleManifests__[option.name];
                      result = commonModuleContext && commonModuleManifest && resolveModule(external, commonModuleContext.require || commonModuleContext.__require__, commonModuleManifest.nodeModulesPath, manifest.nodeModulesPath);
                      return result !== undefined;
                    });
                  }

                  if (result === undefined && external["var"]) result = window[external["var"]];

                  if (!isShare && result === undefined) {
                    console.error("warning:[import-remote:remote]module \"".concat(scopeName, "\" need external \"").concat(external.name, "\" !"));
                  }

                  return result;
                };

                if (!__remoteModuleWebpack__[scopeName]) {
                  globalObject = manifest.windowObject || 'window';
                  newGlobalObject = manifest.globalObject || '__context__';
                  libraryTarget = manifest.libraryTarget;
                  hotUpdateGlobal = manifest.hotUpdateGlobal || 'webpackHotUpdate';
                  hotSourceRegx = hotUpdateGlobal ? new RegExp("".concat(!libraryTarget || libraryTarget === 'var' ? '^(\\/\\*[A-z\\s*():/.",-]+\\*\\/\\n)?' : '').concat(globalObject, "(?:(?:\\[\")|\\.)").concat(hotUpdateGlobal, "(?:\"\\])?")) : null;
                  jsonpFunction = manifest.jsonpFunction || 'webpackJsonp';
                  jsonpSourceRegx = new RegExp("".concat(!libraryTarget || libraryTarget === 'var' ? '^(?:\\/\\*[A-Za-z0-9\\s*():/.",\\-!_$@#%&~]+\\*\\/\\n)?' : '', "(?:var ([A-Za-z0-9_$]+);[A-Za-z0-9_$\\s=]+\\n?)?\\(").concat(globalObject, "(?:(?:\\[\")|\\.)").concat(jsonpFunction, "(?:\"\\])?\\s?=\\s?").concat(globalObject, "(?:(?:\\[\")|\\.)").concat(jsonpFunction, "(?:\"\\])?\\s?\\|\\|\\s?\\[\\]\\)"));
                  batchReplaces = manifest.batchReplaces && manifest.batchReplaces.map(function (v) {
                    if (!Array.isArray(v)) return v;
                    return v.map(function (w) {
                      if (typeof w !== 'string') return w;
                      return w.replace(/%SCOPE_NAME%/g, scopeName);
                    });
                  });
                  ctx = __remoteModuleWebpack__[scopeName] = createContext(windowProxy.context);
                  Object.assign(ctx, remote.globals, globals);
                  (0, _utils.innumerable)(ctx, '__remoteModuleWebpack__', __remoteModuleWebpack__);
                  (0, _utils.innumerable)(ctx, '__HOST__', host);
                  ctx.__windowProxy__ = createWindowProxy(windowProxy, {
                    scoped: manifest.scopeName,
                    host: host,
                    beforeSource: _beforeSource
                  });
                  ctx.require = (0, _runtime2["default"])(_objectSpread(_objectSpread({}, manifest), {}, {
                    scopeName: scopeName,
                    host: host,
                    context: ctx,
                    cached: cached,
                    sourcemapHost: sourcemapHost || manifest.sourcemapHost,
                    requireExternal: requireExternal,
                    beforeSource: function beforeSource(source, type) {
                      if (type === 'js') {
                        var sourcePrefix;

                        if (jsonpSourceRegx) {
                          var match = source.match(jsonpSourceRegx);

                          var _ref7 = match || [];

                          var _ref8 = (0, _slicedToArray2["default"])(_ref7, 1);

                          sourcePrefix = _ref8[0];

                          if (sourcePrefix) {
                            var appVar = match[1] || '';
                            var newSourcePrefix1 = "(".concat(newGlobalObject, "['").concat(jsonpFunction, "']=").concat(newGlobalObject, "['").concat(jsonpFunction, "']||[])");
                            source = (match.index ? source.substr(0, match.index) : '') + (appVar ? "var ".concat(appVar, "=").concat(globalObject, ".").concat(appVar, "=\n") : '') + newSourcePrefix1 + source.substr(match.index + sourcePrefix.length);
                          }
                        }

                        if (!sourcePrefix && hotSourceRegx) {
                          var _match = source.match(hotSourceRegx);

                          var _ref9 = _match || [],
                              _ref10 = (0, _slicedToArray2["default"])(_ref9, 1),
                              hotSourcePrefix = _ref10[0];

                          if (hotSourcePrefix) {
                            source = (_match.index ? source.substr(0, _match.index) : '') + "(typeof ".concat(hotUpdateGlobal, " !== \"undefined\") && ").concat(hotUpdateGlobal) + source.substr(_match.index + hotSourcePrefix.length);
                          }
                        } // eslint-disable-next-line arrow-body-style


                        var checkOffset = function checkOffset(source, offset, match, replaceStr) {
                          // if (/^ ?=/.test(source.substr(offset + match.length, 2))) return match;
                          if (!offset) return replaceStr;

                          if (!/^(window|self|global)\./.test(match)) {
                            var _ref11 = source.substr(offset - 7, 7).match(/(window|self|global)\.$/) || [],
                                _ref12 = (0, _slicedToArray2["default"])(_ref11, 2),
                                prefixVar = _ref12[1];

                            if (prefixVar) offset = Math.max(offset - prefixVar.length - 1, 0);
                          }

                          return offset && ['.', '\'', '"'].includes(source[offset - 1]) ? match : replaceStr;
                        };

                        var sources = splitSource(source, /[\s<>|&{}:,;()"'+=*![\]/\\]/);
                        sources.forEach(function (src, i) {
                          var replaceStr1 = 'document'.concat('.documentElement.getElementsBy');
                          var replaceStr2 = 'document'.concat('.documentElement').concat('.querySelector');
                          src = batchReplace(src, [[/\b(?:window\.)?document\.getElementsBy(TagName(?:NS)?|Name|ClassName)\b/g, function (m, p1, offset, src) {
                            return checkOffset(src, offset, m, replaceStr1 + p1);
                          }], [/\b(?:window\.)?document\.querySelector(All)?\b/g, function (m, p1, offset, src) {
                            return checkOffset(src, offset, m, replaceStr2 + (p1 || ''));
                          }], [/\b(?:window\.)?document\.getElementById\b/g, function (m, offset, src) {
                            return checkOffset(src, offset, m, '__windowProxy__.doc.getElementById');
                          }], [/\b(?:window\.)?document\.createElement\b/g, function (m, offset, src) {
                            return checkOffset(src, offset, m, '__windowProxy__.doc.createElement');
                          }], [/\b(?:window\.)?document\.body\b/g, function (m, offset, src) {
                            return checkOffset(src, offset, m, '__windowProxy__.doc.body');
                          }], [/\b(?:window\.)?document\.head\b/g, function (m, offset, src) {
                            return checkOffset(src, offset, m, '__windowProxy__.doc.head');
                          }], [/\b(?:window\.)?document\.documentElement\b/g, function (m, offset, src) {
                            return checkOffset(src, offset, m, '__windowProxy__.doc.html');
                          }], ctx.__windowProxy__.addEventListener ? [/\bwindow\.addEventListener\b/g, '__windowProxy__.addEventListener'] : null, ctx.__windowProxy__.removeEventListener ? [/\bwindow\.removeEventListener\b/g, '__windowProxy__.removeEventListener'] : null]);
                          if (batchReplaces) src = batchReplace(src, batchReplaces);

                          if (manifest.globalToScopes) {
                            src = batchReplace(src, manifest.globalToScopes.map(function (varName) {
                              if (Array.isArray(varName)) return varName;
                              return [new RegExp("\\b(?:global|window)\\.".concat((0, _escapeStringRegexp["default"])(varName), "\\b")), "__windowProxy__.globals.".concat(varName)];
                            }));
                          }

                          sources[i] = src;
                        });
                        return sources.join('');
                      }

                      if (_beforeSource) source = _beforeSource(source, type, manifest);
                      return source;
                    }
                  }));
                }

                context = __remoteModuleWebpack__[scopeName];
                __require__ = context.require || context.__require__; // eslint-disable-next-line no-empty

                if (!context.promisePending) {
                  _context3.next = 50;
                  break;
                }

                _context3.prev = 43;
                _context3.next = 46;
                return context.promisePending;

              case 46:
                _context3.next = 50;
                break;

              case 48:
                _context3.prev = 48;
                _context3.t3 = _context3["catch"](43);

              case 50:
                (0, _utils.innumerable)(context, 'promisePending', Promise.all(manifest.entrys.ids.map(function (id) {
                  return __require__.e(id);
                })));
                _context3.prev = 51;
                _context3.next = 54;
                return context.promisePending;

              case 54:
                _context3.prev = 54;
                delete context.promisePending;
                return _context3.finish(54);

              case 57:
                manifest.externals.forEach(function (external) {
                  if (__require__.m[external.id] && __require__.m[external.id].__import_remote_external__) return;

                  var fn = function fn(module) {
                    if (fn.__import_remote_module__) return fn.__import_remote_module__.exports;
                    if (!module) module = {};
                    module.exports = requireExternal(external);
                    fn.__import_remote_module__ = module;
                    return module.exports;
                  };

                  fn.__import_remote_external__ = true;
                  __require__.m[external.id] = fn;
                });
                manifest.shareModules && manifest.shareModules.forEach(function (item) {
                  var oldModule = __require__.m[item.id];
                  if (oldModule && (oldModule.__import_remote_shared__ || oldModule.__import_remote_external__)) return;
                  var newModule = requireExternal(item, true);

                  if (newModule !== undefined) {
                    var itemVersion = item.version;

                    if (itemVersion) {
                      var getVersion = item.getVersion;
                      var moduleVersion;

                      if (getVersion) {
                        moduleVersion = getVersion.call(item, newModule, __require__.m[item.id], __require__.m);
                      } else {
                        moduleVersion = newModule.version || '';

                        if (!moduleVersion && newModule.__esModule && newModule["default"] && newModule["default"].version) {
                          moduleVersion = newModule["default"].version;
                        }
                      }

                      if ((0, _utils.isFunction)(itemVersion) && !itemVersion.call(item, moduleVersion, newModule, {
                        versionLt: _semver.versionLt,
                        satisfy: _semver.satisfy
                      })) return;
                      if (!moduleVersion) return;
                      if (typeof itemVersion === 'string' && !(0, _semver.satisfy)(itemVersion, moduleVersion)) return;

                      if (Array.isArray(itemVersion)) {
                        var _itemVersion = (0, _slicedToArray2["default"])(itemVersion, 2),
                            ver1 = _itemVersion[0],
                            ver2 = _itemVersion[1];

                        if (ver1 && (0, _semver.versionLt)(moduleVersion, ver1)) return;
                        if (ver2 && (0, _semver.versionLt)(ver2, moduleVersion, true)) return;
                      }

                      if (itemVersion instanceof RegExp && !itemVersion.test(moduleVersion)) return;
                    }

                    var fn = function fn(module) {
                      if (module) module.exports = newModule;
                      return newModule;
                    };

                    fn.__import_remote_shared__ = true;
                    __require__.m[item.id] = fn;
                  }
                });

                if (!__require__._init) {
                  _context3.next = 62;
                  break;
                }

                _context3.next = 62;
                return __require__._init(manifest.remotes);

              case 62:
                resolve(requireModule(__require__, manifest));
                _context3.next = 69;
                break;

              case 65:
                _context3.prev = 65;
                _context3.t4 = _context3["catch"](1);
                reject(_context3.t4);
                throw _context3.t4;

              case 69:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, null, [[1, 65], [43, 48], [51,, 54, 57]]);
      }));

      return function (_x2, _x3) {
        return _ref5.apply(this, arguments);
      };
    }())
  };
  return cached[url].result.then(function (r) {
    return resolveResult(r, options);
  });
}

remote.externals = {};
remote.globals = {// _interopRequireDefault: require('babel-runtime/helpers/interopRequireDefault').default
};
var _default = remote;
exports["default"] = _default;