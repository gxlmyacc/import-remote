import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import hashSum from 'hash-sum';
import remote from '../..';
import { createAppView } from './app';
import { createShadowRoot, createDOMElement, isForwardComponent, isReactComponent, supportShadow } from './utils';

// eslint-disable-next-line no-useless-escape
const REGX_CSS_SELECTOR = /((?:^|[\n},]|(?:"UTF\-8";(?:\/\*.*\*\/)?)|(?:\.css\);)))([^{},\s();/\\@\d][^{},\s();/\\@]*)/ig;
const REGX_CSS_FUNC_VALUE = /^url$/;
// eslint-disable-next-line max-len
// /^(url|black|white|red|green|blue|yellow|pink|gray|gold|orange|olive|purple|silver|[-?\d.]+(?:deg|grad|rad|turn|v[h|w]|vmax|vmin|c[mh]|mm|in|%|r?e[mx]|p[xtc]|m?s)|#[a-z0-9]+)$/;

let RemoteViewSeed = 0;

class RemoteView extends React.Component {

  constructor(props) {
    super(props);
    this.$refs = {};
    this.state = { loading: false, viewSrc: '', view: null };
    this.viewContext = { cached: {} };
    this.viewScopeName = null;
    this.viewScopeSeed = ++RemoteViewSeed;
    this.listeners = [];
  }

  componentDidMount() {
    this._loadView();
  }

  componentWillMount() {
    this._destoryView();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.src !== prevProps.src) {
      this._loadView();
    }
  }

  reload() {
    this._destoryView(this.viewScopeName);
    this._loadView();
  }

  _destoryView(viewScopeName) {
    if (!viewScopeName) viewScopeName = this.viewScopeName;
    if (!viewScopeName) return;

    const scopeName = viewScopeName;

    let listeners = this.viewContext[scopeName] && this.viewContext[scopeName].listeners;
    if (listeners) {
      listeners.forEach(v => window.removeEventListener(v.type, v.listener));
      listeners.splice(0, listeners.length);
    }

    let els = document.querySelectorAll(scopeName);
    els.forEach(el => el.parent && el.parent.removeChild(el));
    delete this.viewContext[scopeName];


    const bodyEl = this.$refs.body;
    let bodyClassName = bodyEl && bodyEl.className;

    if (this.viewScopeHash && bodyClassName.includes(this.viewScopeHash)) {
      bodyClassName = bodyClassName.replace(this.viewScopeHash, '');
    }
    if (this.viewNamespace && bodyClassName.includes(this.viewNamespace)) {
      bodyClassName = bodyClassName.replace(this.viewNamespace, '');
    }
    if (bodyClassName !== bodyEl.className) bodyEl.className = bodyClassName.split(' ').filter(Boolean).join(' ');

    this.viewScopeName = '';
    this.viewScopeHash = '';
    this.viewNamespace = '';
    this.viewManifest = null;
  }

  _loadView() {
    let {
      src, externals, scopePrefix, scopeStyle, module, moduleName, classPrefix, shadow, exportName,
      transfromHtmlBodyTagClass,
      onViewLoading, onViewError
    } = this.props;
    let { viewSrc } = this.state;
    let _require = options => remote(src, options);
    if (!src && module) {
      src = moduleName ? module.resolveModuleUrl(moduleName) : '';
      _require = options => {
        if (options.externals === undefined) delete options.externals;
        return module.require(moduleName, options);
      };
    }
    if (viewSrc === src) return;
    if (!src) {
      return this.setState({ loading: false, viewSrc: '', view: null });
    }
    this.setState({ loading: true });
    onViewLoading && onViewLoading(true);

    let oldScopeName = null;
    const _finally = () => {
      this.setState({ loading: false, ...state }, () => {
        onViewLoading && onViewLoading(false);
        if (oldScopeName && oldScopeName !== this.viewScopeName) this._destoryView(oldScopeName);
      });
    };

    const bodyEl = this.$refs.body;

    const state = {};
    _require({
      externals,
      windowProxy: {
        context: this.viewContext,
        document: {
          html: this.$refs.html,
          head: this.$refs.head,
          body: this.$refs.body
        },
        addEventListener(type, listener, ...args) {
          if (this.viewScopeName) {
            const viewContext = this.viewContext[this.viewScopeName];
            if (viewContext) {
              const listeners = viewContext && viewContext.listeners;
              if (!listeners) viewContext.listeners = [];
              listeners.push(type, listener);
            }
          }
          return window.addEventListener(type, listener, ...args);
        },
        removeEventListener(type, listener, ...args) {
          if (this.viewScopeName) {
            const viewContext = this.viewContext[this.viewScopeName];
            if (viewContext) {
              const listeners = viewContext && viewContext.listeners;
              if (listeners) {
                const idx = listeners.findIndex(v => v.listener === listener);
                if (~idx) listeners.splice(idx, 1);
              }
            }
          }
          return window.removeEventListener(type, listener, ...args);
        }
      },
      beforeSource: (source, type) => {
        if (scopeStyle && (!shadow || !supportShadow || scopeStyle === 'always') && type === 'css') {
          source = source.replace(
            REGX_CSS_SELECTOR,
            (m, p1, p2) => {
              const p2LowerCase = p2 ? p2.toLowerCase() : '';
              if (REGX_CSS_FUNC_VALUE.test(p2LowerCase)) return p1 + p2;
              const isHtmlBodyEl = transfromHtmlBodyTagClass && /^(html|head|body)\b/.test(p2LowerCase);
              if (isHtmlBodyEl) p2 = `.${classPrefix}view${p2LowerCase.startsWith('html') ? '' : '-' + p2LowerCase}`;
              return `${p1} .${this.viewScopeHash}${isHtmlBodyEl ? '' : ' '}${p2}`;
            }
          );
        }
        return source;
      },
      getManifestCallback: viewManifest => {
        let newScopeName = viewManifest.scopeName;
        if (this.viewScopeName === newScopeName) return;
        oldScopeName = this.viewScopeName;
        this.viewScopeName = newScopeName;
        this.viewScopeHash = `${scopePrefix}${hashSum(newScopeName + this.viewScopeSeed)}`;
      }
    }).then(view => {
      if (view && view.__esModule) view = view[exportName];
      if (view.namespace && bodyEl && !bodyEl.className.includes(view.namespace)) {
        this.viewNamespace = view.namespace;
        bodyEl.className = `${bodyEl.className} ${view.namespace}`;
      }
      if (typeof view === 'function' && !isReactComponent(view) && !isForwardComponent(view)) {
        view = createAppView(view);
      }
      Object.assign(state, { view, viewSrc: src });
      _finally();
    }).catch(ex => {
      let errorView = onViewError && onViewError(ex);
      if (errorView !== undefined) Object.assign(state, { view: errorView, viewSrc: '' });
      _finally();
    });
  }

  render() {
    const {
      shadow, classPrefix, tag, className, children, props = {}, style = {}, bodyStyle = {},
      // eslint-disable-next-line no-unused-vars
      scopePrefix, transfromHtmlBodyTagClass, module, moduleName, exportName
    } = this.props;

    const otherProps = {};
    Object.keys(this.props).forEach(key => {
      // eslint-disable-next-line react/forbid-foreign-prop-types
      if (RemoteView.propTypes[key]) return;
      otherProps[key] = this.props[key];
    });

    const shadowChild = shadow && supportShadow;

    const { loading, view: View } = this.state;

    return React.createElement(
      tag,
      {
        key: 'view-html',
        className: `${this.viewScopeHash} ${classPrefix}view  ${
          shadowChild ? '' : `${classPrefix}view-html`
        } ${
          loading ? `${classPrefix}view-loading` : ''
        } ${className || ''}`,
        style,
        ref: r => {
          if (r && !this.$refs.shadowRoot && shadowChild) {
            this.$refs.root = r;
            this.$refs.shadowRoot = createShadowRoot(r);
            this.$refs.html = createDOMElement(tag, { className: `${classPrefix}view-html` }, this.$refs.shadowRoot);
            this.$refs.head = createDOMElement(tag, { className: `${classPrefix}view-head` }, this.$refs.html);
            this.$refs.body = createDOMElement(tag, { className: `${classPrefix}view-body` }, this.$refs.html);
            this.forceUpdate();
          } else this.$refs.html = r;
        },
        ...otherProps
      },
      (shadowChild)
        ? this.$refs.body && View
          ? ReactDOM.createPortal(React.createElement(View, props, children), this.$refs.body)
          : null
        : [
          React.createElement(tag, {
            key: 'view-head',
            className: `${this.viewScopeHash} ${classPrefix}view-head`,
            ref: r => this.$refs.head = r
          }),
          React.createElement(
            tag,
            {
              key: 'view-body',
              className: `${this.viewScopeHash} ${classPrefix}view-body`,
              style: bodyStyle,
              ref: r => this.$refs.body = r
            },
            View ? React.createElement(View, props, children) : null
          )
        ]
    );
  }

}

RemoteView.propTypes = {
  scopeStyle: PropTypes.oneOfType([PropTypes.bool, PropTypes.oneOf(['always'])]),
  scopePrefix: PropTypes.string,
  classPrefix: PropTypes.string,
  className: PropTypes.string,
  transfromHtmlBodyTagClass: PropTypes.bool,
  style: PropTypes.object,
  bodyStyle: PropTypes.object,
  shadow: PropTypes.bool,
  tag: PropTypes.string,
  src: PropTypes.string,
  module: PropTypes.object,
  moduleName: PropTypes.string,
  exportName: PropTypes.string,
  props: PropTypes.object,
  externals: PropTypes.object,
  onViewLoading: PropTypes.func,
  onViewError: PropTypes.func,
};

RemoteView.defaultProps = {
  scopePrefix: 'v-',
  classPrefix: 'import-remote-',
  tag: 'div',
  exportName: 'default',
  transfromHtmlBodyTagClass: true,
};

export default RemoteView;
