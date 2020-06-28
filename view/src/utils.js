
const hasSymbol = typeof Symbol === 'function' && Symbol.for;
const REACT_FORWARD_REF_TYPE = hasSymbol ? Symbol.for('react.forward_ref') : 0xead0;

function isReactComponent(component) {
  return component && component.prototype && component.prototype.render
    && component.isReactClass;
}

function isForwardComponent(component) {
  return component && (component.$$typeof === REACT_FORWARD_REF_TYPE) 
    && (typeof component.render === 'function');
}

export {
  isReactComponent,
  isForwardComponent
};