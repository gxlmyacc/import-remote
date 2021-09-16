"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

require("core-js/modules/es6.object.define-property");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.string.iterator");

require("core-js/modules/es6.array.from");

require("core-js/modules/es6.function.name");

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es6.date.to-string");

require("core-js/modules/es6.object.to-string");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseRange = exports.satisfy = exports.rangeToString = exports.versionLt = exports.parseVersion = void 0;

require("core-js/modules/es6.function.bind");

require("core-js/modules/es6.string.trim");

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

require("core-js/modules/es6.regexp.replace");

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

require("core-js/modules/es6.array.is-array");

require("core-js/modules/es6.regexp.split");

require("core-js/modules/es6.array.map");

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

/** @typedef {(string|number|undefined|[])[]} SemVerRange */

/**
 * @param {string} str version string
 * @returns {(string|number|undefined|[])[]} parsed version
 */
var parseVersion = function parseVersion(str) {
  var splitAndConvert = function splitAndConvert(str) {
    return str.split('.').map(function (item) {
      // eslint-disable-next-line eqeqeq
      return +item == item ? +item : item;
    });
  };

  var match = /^([^-+]+)?(?:-([^+]+))?(?:\+(.+))?$/.exec(str);
  /** @type {(string|number|undefined|[])[]} */

  var ver = match[1] ? splitAndConvert(match[1]) : [];

  if (match[2]) {
    ver.length++;
    ver.push.apply(ver, splitAndConvert(match[2]));
  }

  if (match[3]) {
    ver.push([]);
    ver.push.apply(ver, splitAndConvert(match[3]));
  }

  return ver;
};
/* eslint-disable eqeqeq */

/**
 * @param {string} a version
 * @param {string} b version
 * @returns {boolean} true, iff a < b
 */


exports.parseVersion = parseVersion;

var versionLt = function versionLt(a, b) {
  var withEqual = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  a = Array.isArray(a) ? a : parseVersion(a);
  b = Array.isArray(b) ? b : parseVersion(b);
  var i = 0;

  for (;;) {
    // a       b  EOA     object  undefined  number  string
    // EOA        a == b  a < b   b < a      a < b   a < b
    // object     b < a   (0)     b < a      a < b   a < b
    // undefined  a < b   a < b   (0)        a < b   a < b
    // number     b < a   b < a   b < a      (1)     a < b
    // string     b < a   b < a   b < a      b < a   (1)
    // EOA end of array
    // (0) continue on
    // (1) compare them via "<"
    // Handles first row in table
    if (i >= a.length) return i < b.length && (0, _typeof2["default"])(b[i])[0] !== 'u';
    var aValue = a[i];
    var aType = (0, _typeof2["default"])(aValue)[0]; // Handles first column in table

    if (i >= b.length) return aType === 'u';
    var bValue = b[i];
    var bType = (0, _typeof2["default"])(bValue)[0];

    if (aType == bType) {
      if (aType !== 'o' && aType !== 'u' && aValue !== bValue) {
        return withEqual ? aValue <= bValue : aValue < bValue;
      }

      i++;
    } else {
      // Handles remaining cases
      if (aType === 'o' && bType === 'n') return true;
      return bType === 's' || aType === 'u';
    }
  }
};

exports.versionLt = versionLt;

var rangeToString = function rangeToString(range) {
  if (range.length === 1) {
    return '*';
  }

  if (0 in range) {
    var str = '';
    var fixCount = range[0];
    str += fixCount == 0 ? '>=' : fixCount == -1 ? '<' : fixCount == 1 ? '^' : fixCount == 2 ? '~' : fixCount > 0 ? '=' : '!=';
    var needDot = 1; // eslint-disable-next-line no-redeclare

    for (var i = 1; i < range.length; i++) {
      var item = range[i];
      var t = (0, _typeof2["default"])(item)[0];
      needDot--;
      str += t == 'u' ? '-' // undefined: prerelease marker, add an "-"
      : (needDot > 0 ? '.' : '') + (needDot = 2, item); // number or string: add the item, set flag to add an "." between two of them
    }

    return str;
  }

  var stack = []; // eslint-disable-next-line no-redeclare

  for (var _i = 1; _i < range.length; _i++) {
    // eslint-disable-next-line no-redeclare
    var _item = range[_i];
    stack.push(_item === 0 ? 'not(' + pop() + ')' : _item === 1 ? '(' + pop() + ' || ' + pop() + ')' : _item === 2 ? stack.pop() + ' ' + stack.pop() : rangeToString(_item));
  }

  return pop();

  function pop() {
    return stack.pop().replace(/^\((.+)\)$/, '$1');
  }
};

exports.rangeToString = rangeToString;

var parseRange = function parseRange(str) {
  var splitAndConvert = function splitAndConvert(str) {
    return str.split('.').map(function (item) {
      return "".concat(+item) === item ? +item : item;
    });
  }; // see https://docs.npmjs.com/misc/semver#range-grammar for grammar


  var parsePartial = function parsePartial(str) {
    var match = /^([^-+]+)?(?:-([^+]+))?(?:\+(.+))?$/.exec(str);
    /** @type {(string|number|undefined|[])[]} */

    var ver = match[1] ? [0].concat((0, _toConsumableArray2["default"])(splitAndConvert(match[1]))) : [0];

    if (match[2]) {
      ver.length++;
      ver.push.apply(ver, splitAndConvert(match[2]));
    } // remove trailing any matchers


    var last = ver[ver.length - 1];

    while (ver.length && (last === undefined || /^[*xX]$/.test(
    /** @type {string} */
    last))) {
      ver.pop();
      last = ver[ver.length - 1];
    }

    return ver;
  };

  var toFixed = function toFixed(range) {
    if (range.length === 1) {
      // Special case for "*" is "x.x.x" instead of "="
      return [0];
    }

    if (range.length === 2) {
      // Special case for "1" is "1.x.x" instead of "=1"
      return [1].concat((0, _toConsumableArray2["default"])(range.slice(1)));
    }

    if (range.length === 3) {
      // Special case for "1.2" is "1.2.x" instead of "=1.2"
      return [2].concat((0, _toConsumableArray2["default"])(range.slice(1)));
    }

    return [range.length].concat((0, _toConsumableArray2["default"])(range.slice(1)));
  };

  var negate = function negate(range) {
    return [-range[0] - 1].concat((0, _toConsumableArray2["default"])(range.slice(1)));
  };

  var parseSimple = function parseSimple(str) {
    // simple     ::= primitive | partial | tilde | caret
    // primitive  ::= ( '<' | '>' | '>=' | '<=' | '=' ) partial
    // tilde      ::= '~' partial
    // caret      ::= '^' partial
    var match = /^(\^|~|<=|<|>=|>|=|v|!)/.exec(str);
    var start = match ? match[0] : '';
    var remainder = parsePartial(str.slice(start.length));

    switch (start) {
      case '^':
        if (remainder.length > 1 && remainder[1] === 0) {
          if (remainder.length > 2 && remainder[2] === 0) {
            return [3].concat((0, _toConsumableArray2["default"])(remainder.slice(1)));
          }

          return [2].concat((0, _toConsumableArray2["default"])(remainder.slice(1)));
        }

        return [1].concat((0, _toConsumableArray2["default"])(remainder.slice(1)));

      case '~':
        return [2].concat((0, _toConsumableArray2["default"])(remainder.slice(1)));

      case '>=':
        return remainder;

      case '=':
      case 'v':
      case '':
        return toFixed(remainder);

      case '<':
        return negate(remainder);

      case '>':
        {
          // and( >=, not( = ) ) => >=, =, not, and
          var fixed = toFixed(remainder); // eslint-disable-next-line no-sparse-arrays

          return [, fixed, 0, remainder, 2];
        }

      case '<=':
        // or( <, = ) => <, =, or
        // eslint-disable-next-line no-sparse-arrays
        return [, toFixed(remainder), negate(remainder), 1];

      case '!':
        {
          // not =
          var _fixed = toFixed(remainder); // eslint-disable-next-line no-sparse-arrays


          return [, _fixed, 0];
        }

      default:
        throw new Error('Unexpected start value');
    }
  };

  var combine = function combine(items, fn) {
    if (items.length === 1) return items[0];
    var arr = [];

    var _iterator = _createForOfIteratorHelper(items.slice().reverse()),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var item = _step.value;

        if (0 in item) {
          arr.push(item);
        } else {
          arr.push.apply(arr, (0, _toConsumableArray2["default"])(item.slice(1)));
        }
      } // eslint-disable-next-line no-sparse-arrays

    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }

    return [,].concat(arr, (0, _toConsumableArray2["default"])(items.slice(1).map(function () {
      return fn;
    })));
  };

  var parseRange = function parseRange(str) {
    // range      ::= hyphen | simple ( ' ' simple ) * | ''
    // hyphen     ::= partial ' - ' partial
    var items = str.split(' - ');

    if (items.length === 1) {
      var _items = str.trim().split(/\s+/g).map(parseSimple);

      return combine(_items, 2);
    }

    var a = parsePartial(items[0]);
    var b = parsePartial(items[1]); // >=a <=b => and( >=a, or( <b, =b ) ) => >=a, <b, =b, or, and
    // eslint-disable-next-line no-sparse-arrays

    return [, toFixed(b), negate(b), 1, a, 2];
  };

  var parseLogicalOr = function parseLogicalOr(str) {
    // range-set  ::= range ( logical-or range ) *
    // logical-or ::= ( ' ' ) * '||' ( ' ' ) *
    var items = str.split(/\s*\|\|\s*/).map(parseRange);
    return combine(items, 1);
  };

  return parseLogicalOr(str);
};
/**
 * @param {SemVerRange} range version range
 * @param {string} version the version
 * @returns {boolean} if version satisfy the range
 */


exports.parseRange = parseRange;

var satisfy = function satisfy(range, version) {
  if (typeof range === 'string') range = parseRange(range);

  if (0 in range) {
    version = parseVersion(version);
    var fixCount = range[0]; // when negated is set it swill set for < instead of >=

    var negated = fixCount < 0;
    if (negated) fixCount = -fixCount - 1;

    for (var i = 0, j = 1, isEqual = true;; j++, i++) {
      // cspell:word nequal nequ
      // when isEqual = true:
      // range         version: EOA/object  undefined  number    string
      // EOA                    equal       block      big-ver   big-ver
      // undefined              bigger      next       big-ver   big-ver
      // number                 smaller     block      cmp       big-cmp
      // fixed number           smaller     block      cmp-fix   differ
      // string                 smaller     block      differ    cmp
      // fixed string           smaller     block      small-cmp cmp-fix
      // when isEqual = false:
      // range         version: EOA/object  undefined  number    string
      // EOA                    nequal      block      next-ver  next-ver
      // undefined              nequal      block      next-ver  next-ver
      // number                 nequal      block      next      next
      // fixed number           nequal      block      next      next   (this never happens)
      // string                 nequal      block      next      next
      // fixed string           nequal      block      next      next   (this never happens)
      // EOA end of array
      // equal (version is equal range):
      //   when !negated: return true,
      //   when negated: return false
      // bigger (version is bigger as range):
      //   when fixed: return false,
      //   when !negated: return true,
      //   when negated: return false,
      // smaller (version is smaller as range):
      //   when !negated: return false,
      //   when negated: return true
      // nequal (version is not equal range (> resp <)): return true
      // block (version is in different prerelease area): return false
      // differ (version is different from fixed range (string vs. number)): return false
      // next: continues to the next items
      // next-ver: when fixed: return false, continues to the next item only for the version, sets isEqual=false
      // big-ver: when fixed || negated: return false, continues to the next item only for the version, sets isEqual=false
      // next-nequ: continues to the next items, sets isEqual=false
      // cmp (negated === false): version < range => return false, version > range => next-nequ, else => next
      // cmp (negated === true): version > range => return false, version < range => next-nequ, else => next
      // cmp-fix: version == range => next, else => return false
      // big-cmp: when negated => return false, else => next-nequ
      // small-cmp: when negated => next-nequ, else => return false
      var rangeType = j < range.length ? (0, _typeof2["default"])(range[j])[0] : '';
      var versionValue = void 0;
      var versionType = void 0; // Handles first column in both tables (end of version or object)

      if (i >= version.length || (versionValue = version[i], (versionType = (0, _typeof2["default"])(versionValue)[0]) === 'o')) {
        // Handles nequal
        if (!isEqual) return true; // Handles bigger

        if (rangeType === 'u') return j > fixCount && !negated; // Handles equal and smaller: (range === EOA) XOR negated

        return rangeType === '' != negated; // equal + smaller
      } // Handles second column in both tables (version = undefined)


      if (versionType == 'u') {
        if (!isEqual || rangeType !== 'u') {
          return false;
        }
      } else if (isEqual) {
        // switch between first and second table
        // Handle diagonal
        if (rangeType == versionType) {
          if (j <= fixCount) {
            // Handles "cmp-fix" cases
            if (versionValue != range[j]) {
              return false;
            }
          } else {
            // Handles "cmp" cases
            if (negated ? versionValue > range[j] : versionValue < range[j]) {
              return false;
            }

            if (versionValue != range[j]) isEqual = false;
          }
        } else if (rangeType != 's' && rangeType != 'n') {
          // Handle big-ver
          if (negated || j <= fixCount) return false;
          isEqual = false;
          j--; // eslint-disable-next-line no-mixed-operators
        } else if (j <= fixCount || versionType < rangeType != negated) {
          // Handle differ, big-cmp and small-cmp
          return false;
        } else {
          isEqual = false;
        }
      } else {
        // Handles all "next-ver" cases in the second table
        if (rangeType !== 's' && rangeType !== 'n') {
          isEqual = false;
          j--;
        } // next is applied by default

      }
    }
  }
  /** @type {(boolean | number)[]} */


  var stack = [];
  var p = stack.pop.bind(stack); // eslint-disable-next-line no-redeclare

  for (var _i2 = 1; _i2 < range.length; _i2++) {
    var item =
    /** @type {SemVerRange | 0 | 1 | 2} */
    range[_i2];
    stack.push(item == 1 ? p() | p() : item == 2 ? p() & p() : item ? satisfy(item, version) : !p());
  }

  return !!p();
};

exports.satisfy = satisfy;