import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import remote from '../..';
import { createAppView } from './app';
import { createShadowRoot, createDOMElement, isForwardComponent, isReactComponent, supportShadow } from './utils';

class RemoteView extends React.Component {

  static propTypes = {
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

    this.viewManifest = null;
  }

  _loadView() {
    let { src, externals, module, moduleName, shadow, onViewLoading, onViewError } = this.props;
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
    const state = {};
    _require({
      externals,
      windowProxy: {
        context: this.viewContext,
        document: {
          html: shadow ? (this.$refs.shadowHtml || this.$refs.html) : this.$refs.html,
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
      getManifestCallback: viewManifest => {
        let newScopeName = viewManifest.scopeName;
        if (this.viewScopeName === newScopeName) return;
        oldScopeName = this.viewScopeName;
        this.viewScopeName = newScopeName;
      }
    }).then(view => {
      if (view && view.__esModule) view = view.default;
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
      // eslint-disable-next-line no-unused-vars
      src, externals, onViewLoading, onViewError, module, moduleName, shadow,
      classPrefix, tag, className, children, props = {}, 
      ...otherProps 
    } = this.props;

    const shadowChild = shadow && supportShadow;

    const { loading, view: View } = this.state;

    return React.createElement(
      tag, 
      {
        className: `${classPrefix}view ${classPrefix}view-html ${loading ? `${classPrefix}view-loading` : ''} ${className || ''}`,
        ref: r => {
          this.$refs.html = r;
          if (r && !this.$refs.shadowHtml && shadowChild) {
            this.$refs.shadowHtml = createShadowRoot(r);
            this.$refs.head = createDOMElement(tag, { className: `${classPrefix}view-head` }, this.$refs.shadowHtml);
            this.$refs.body = createDOMElement(tag, { 
              className: `${classPrefix}view-body`, 
              style: { height: '100%' } 
            }, this.$refs.shadowHtml);
            this.forceUpdate();
          }
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