import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import hashSum from 'hash-sum';
import remote from '../..';
import { createAppView } from './app';
import { createShadowRoot, createDOMElement, isForwardComponent, isReactComponent, supportShadow } from './utils';

class RemoteView extends React.Component {

  static propTypes = {
    scopeStyle: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    scopePrefix: PropTypes.string, 
    classPrefix: PropTypes.string,
    className: PropTypes.string,
    tag: PropTypes.string,
    src: PropTypes.string,
    module: PropTypes.object,
    moduleName: PropTypes.string,
    props: PropTypes.object,
    externals: PropTypes.object,
    onViewLoading: PropTypes.func,
    onViewError: PropTypes.func,
  }

  static defaultProps = {
    scopePrefix: 'v-',
    classPrefix: 'import-remote-',
    tag: 'div'
  }

  constructor(props) {
    super(props);
    this.$refs = {};
    this.state = { loading: false, viewSrc: '', view: null };
    this.viewContext = { cached: {} };
    this.viewScopeName = null;
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
    let { src, externals, scopePrefix, scopeStyle, module, moduleName, shadow, onViewLoading, onViewError } = this.props;
    let { viewSrc } = this.state;
    let _require = options => remote(src, options);
    if (!src && module) {
      src = moduleName ? module.resolveModuleUrl(moduleName) : '';
      _require = options => module.require(moduleName, options);
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
          source = source.replace(/([\n}])([.A-Za-z*:#[])/g, (m, p1, p2) => `${p1} .${this.viewScopeHash} ${p2}`);
        }
        return source;
      },
      getManifestCallback: viewManifest => {
        let newScopeName = viewManifest.scopeName;
        if (this.viewScopeName === newScopeName) return;
        oldScopeName = this.viewScopeName;
        this.viewScopeName = newScopeName;
        this.viewScopeHash = `${scopePrefix}${hashSum(newScopeName)}`;
     
        if (!bodyEl.className.includes(this.viewScopeHash)) bodyEl.className = `${bodyEl.className} ${this.viewScopeHash}`;
      }
    }).then(view => {
      if (view && view.__esModule) view = view.default;
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
      shadow, classPrefix, tag, className, children, props = {},  
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
        className: `${classPrefix}view ${
          shadowChild ? '' : `${classPrefix}view-html`
        } ${
          loading ? `${classPrefix}view-loading` : ''
        } ${className || ''}`,
        ref: r => {
          if (r && !this.$refs.shadowRoot && shadowChild) {
            this.$refs.root = r;
            this.$refs.shadowRoot = createShadowRoot(r);
            this.$refs.html = createDOMElement(tag, { className: `${classPrefix}view-html`, style: { height: '100%' } }, this.$refs.shadowRoot);
            this.$refs.head = createDOMElement(tag, { className: `${classPrefix}view-head` }, this.$refs.html);
            this.$refs.body = createDOMElement(tag, { 
              className: `${classPrefix}view-body`, 
              style: { height: '100%' } 
            }, this.$refs.html);
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
            className: `${classPrefix}view-head`,
            ref: r => this.$refs.head = r
          }),
          React.createElement(
            tag, 
            {
              className: `${classPrefix}view-body`,
              style: { height: '100%' },
              ref: r => this.$refs.body = r
            },
            View ? React.createElement(View, props, children) : null
          )
        ]
    ); 
  }

}

export default RemoteView;