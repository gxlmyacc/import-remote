

type SemVerRange = (string|number|undefined|[])[];

/**
 * @param {SemVerRange} range version range
 * @param {string} version the version
 * @returns {boolean} if version satisfy the range
 */
declare function satisfy(range: SemVerRange, version: string): boolean;

/**
 * @param {string} a version
 * @param {string} b version
 * @returns {boolean} true, iff a < b
 */
declare function versionLt(a: string, b: string, withEqual?: boolean): boolean;

export {
  SemVerRange,

  satisfy,
  versionLt
}
