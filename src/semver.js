/** @typedef {(string|number|undefined|[])[]} SemVerRange */

/**
 * @param {string} str version string
 * @returns {(string|number|undefined|[])[]} parsed version
 */
const parseVersion = str => {
  let splitAndConvert = function (str) {
    return str.split('.').map(function (item) {
      // eslint-disable-next-line eqeqeq
      return +item == item ? +item : item;
    });
  };
  let match = /^([^-+]+)?(?:-([^+]+))?(?:\+(.+))?$/.exec(str);
  /** @type {(string|number|undefined|[])[]} */
  let ver = match[1] ? splitAndConvert(match[1]) : [];
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
const versionLt = (a, b) => {
  a = parseVersion(a);
  b = parseVersion(b);
  let i = 0;
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
    if (i >= a.length) return i < b.length && (typeof b[i])[0] != 'u';

    let aValue = a[i];
    let aType = (typeof aValue)[0];

    // Handles first column in table
    if (i >= b.length) return aType == 'u';

    let bValue = b[i];
    let bType = (typeof bValue)[0];

    if (aType == bType) {
      if (aType != 'o' && aType != 'u' && aValue != bValue) {
        return aValue < bValue;
      }
      i++;
    } else {
      // Handles remaining cases
      if (aType == 'o' && bType == 'n') return true;
      return bType == 's' || aType == 'u';
    }
  }
};

const rangeToString = range => {
  if (range.length === 1) {
    return '*';
  } if (0 in range) {
    let str = '';
    let fixCount = range[0];
    str
      += fixCount == 0
        ? '>='
        : fixCount == -1
          ? '<'
          : fixCount == 1
            ? '^'
            : fixCount == 2
              ? '~'
              : fixCount > 0
                ? '='
                : '!=';
    let needDot = 1;
    // eslint-disable-next-line no-redeclare
    for (let i = 1; i < range.length; i++) {
      let item = range[i];
      let t = (typeof item)[0];
      needDot--;
      str
        += t == 'u'
          ? '-' // undefined: prerelease marker, add an "-"
          : (needDot > 0 ? '.' : '') + ((needDot = 2), item); // number or string: add the item, set flag to add an "." between two of them
    }
    return str;
  } 
  let stack = [];
  // eslint-disable-next-line no-redeclare
  for (let i = 1; i < range.length; i++) {
    // eslint-disable-next-line no-redeclare
    let item = range[i];
    stack.push(
      item === 0
        ? 'not(' + pop() + ')'
        : item === 1
          ? '(' + pop() + ' || ' + pop() + ')'
          : item === 2
            ? stack.pop() + ' ' + stack.pop()
            : rangeToString(item)
    );
  }
  return pop();
  
  function pop() {
    return stack.pop().replace(/^\((.+)\)$/, '$1');
  }
};

/**
 * @param {SemVerRange} range version range
 * @param {string} version the version
 * @returns {boolean} if version satisfy the range
 */
const satisfy = (range, version) => {
  if (0 in range) {
    version = parseVersion(version);
    let fixCount = range[0];
    // when negated is set it swill set for < instead of >=
    let negated = fixCount < 0;
    if (negated) fixCount = -fixCount - 1;
    for (let i = 0, j = 1, isEqual = true; ; j++, i++) {
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

      let rangeType = j < range.length ? (typeof range[j])[0] : '';

      let versionValue;
      let versionType;

      // Handles first column in both tables (end of version or object)
      if (
        i >= version.length
        || ((versionValue = version[i]),
        (versionType = (typeof versionValue)[0]) == 'o')
      ) {
        // Handles nequal
        if (!isEqual) return true;
        // Handles bigger
        if (rangeType == 'u') return j > fixCount && !negated;
        // Handles equal and smaller: (range === EOA) XOR negated
        return (rangeType == '') != negated; // equal + smaller
      }

      // Handles second column in both tables (version = undefined)
      if (versionType == 'u') {
        if (!isEqual || rangeType != 'u') {
          return false;
        }
      } else if (isEqual) { // switch between first and second table
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
        } else if (rangeType != 's' && rangeType != 'n') { // Handle big-ver
          if (negated || j <= fixCount) return false;
          isEqual = false;
          j--;
        // eslint-disable-next-line no-mixed-operators
        } else if (j <= fixCount || versionType < rangeType != negated) { // Handle differ, big-cmp and small-cmp
          return false;
        } else {
          isEqual = false;
        }
      } else {
        // Handles all "next-ver" cases in the second table
        if (rangeType != 's' && rangeType != 'n') {
          isEqual = false;
          j--;
        }

        // next is applied by default
      }
    }
  }
  /** @type {(boolean | number)[]} */
  let stack = [];
  let p = stack.pop.bind(stack);
  // eslint-disable-next-line no-redeclare
  for (let i = 1; i < range.length; i++) {
    let item = /** @type {SemVerRange | 0 | 1 | 2} */ (range[i]);
    stack.push(
      item == 1
        ? p() | p()
        : item == 2
          ? p() & p()
          : item
            ? satisfy(item, version)
            : !p()
    );
  }
  return !!p();
};

export {
  parseVersion,
  versionLt,
  rangeToString,
  satisfy
};