import { innumerable, isPlainObject } from './utils';

function defaultRequireFactory(modulesMap) {
  return async function _requireFactory(externals) {
    let moduleExternals = externals.filter(external => modulesMap[external.name]);
    let modules = await Promise.all(moduleExternals.map(external => modulesMap[external.name]()));
    return moduleExternals.reduce((p, external, i) => {
      p[external.name] = modules[i];
      return p;
    }, {});
  };
}

function createRequireFactory(factory) {
  if (isPlainObject(factory)) factory = defaultRequireFactory(factory);
  innumerable(factory, '__import_remote_require_factory__', true);
  return factory;
}

function isRequireFactory(fn) {
  return fn && fn.__import_remote_require_factory__;
}

export {
  isRequireFactory
};

export default createRequireFactory;