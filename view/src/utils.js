
const hasSymbol = typeof Symbol === 'function' && Symbol.for;
const REACT_FORWARD_REF_TYPE = hasSymbol ? Symbol.for('react.forward_ref') : 0xead0;

const supportShadow = Boolean(document.body.attachShadow || document.body.createShadowRoot);

function createShadowRoot(el) {
  return el.attachShadow
    ? el.attachShadow({ mode: 'open' })
    : el.createShadowRoot();
}

function isReactComponent(component) {
  return component && component.prototype && component.prototype.render
    && component.isReactClass;
}

function isForwardComponent(component) {
  return component && (component.$$typeof === REACT_FORWARD_REF_TYPE) 
    && (typeof component.render === 'function');
}

function createDOMElement(tag, props = {}, container) {
  const el = document.createElement(tag);
  if (props.className) el.className = props.className;
  if (props.style) {
    Object.keys(props.style).forEach(key => el.style[key] = props.style[key]);
  }
  if (container) container.appendChild(el);
  return el;
}

function innumerable(
  obj,
  key,
  value,
  options = { configurable: true }
) {
  Object.defineProperty(obj, key, { value, ...options });
  return obj;
}

export {
  supportShadow,
  createShadowRoot,
  createDOMElement,
  
  isReactComponent,
  isForwardComponent,
  innumerable
};