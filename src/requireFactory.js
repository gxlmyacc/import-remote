import { innumerable, isPlainObject, isFunction, hasOwnProp } from './utils';

function defaultRequireFactory(modulesMap) {
  return async function _requireFactory(externals) {
    const moduleExternals = externals.filter(external => hasOwnProp(modulesMap, external.name));
    const modules = await Promise.all(moduleExternals.map(external => {
      const v = modulesMap[external.name];
      return isFunction(v) ? v() : v;
    }));
    return moduleExternals.reduce((p, external, i) => {
      p[external.name] = modules[i];
      return p;
    }, {});
  };
}

/** @type {import('../types/requireFactory').default} */
function createRequireFactory(factory) {
  if (isPlainObject(factory)) factory = defaultRequireFactory(factory);
  innumerable(factory, '__import_remote_require_factory__', true);
  return factory;
}

/** @type {import('../types/requireFactory').isRequireFactory} */
function isRequireFactory(fn) {
  return fn && fn.__import_remote_require_factory__;
}

export {
  isRequireFactory
};

export default createRequireFactory;
