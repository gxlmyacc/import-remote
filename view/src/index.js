import React from 'react';
import PropTypes from 'prop-types';
import remote from '../..';

class RemoteView extends React.Component {

  static propTypes = {
    src: PropTypes.string.isRequired,
    props: PropTypes.object,
    externals: PropTypes.object,
    onViewLoading: PropTypes.func,
    onViewError: PropTypes.func,
  }

  constructor(props) {
    super(props);
    this.$refs = {};
    this.state = { loading: false, viewSrc: '', view: null };
    this.viewContext = {};
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

  async _loadView() {
    let { src, externals, onViewLoading, onViewError } = this.props;
    let { viewSrc } = this.state;
    if (viewSrc === src) return;
    if (!src) {
      return this.setState({ loading: false, viewSrc: '', view: null });
    }
    this.setState({ loading: true });
    onViewLoading && onViewLoading(true);

    let oldScopeName = null;
    const state = {};
    try {
      let view = await remote(src, {
        externals,
        windowProxy: {
          context: this.viewContext,
          document: {
            get html() {
              return this.$refs.html;
            },
            get head() {
              return this.$refs.head;
            },
            get body() {
              return this.$refs.body;
            },
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
      });
      Object.assign(state, { view, viewSrc: src });
    } catch (ex) {
      let errorView = onViewError && onViewError(ex);
      if (errorView !== undefined) Object.assign(state, { view: errorView, viewSrc: '' });
    } finally {
      this.setState({ loading: false, ...state }, () => {
        onViewLoading && onViewLoading(false);
        if (oldScopeName && oldScopeName !== this.viewScopeName) this._destoryView(oldScopeName);
      });
    }
  }
  
  render() {
    // eslint-disable-next-line no-unused-vars
    const { className, src, externals, onViewLoading, onViewError, props = {}, ...otherProps } = this.props;
    const { loading, view: View } = this.state;
    return <div
      className={`import-remote-view import-remote-view-html ${loading ? 'view-loading' : ''} ${className || ''}`}
      ref={r => this.$refs.html = r}
      {...otherProps}>
      <div className="import-remote-view-head" ref={r => this.$refs.head = r}>
      </div>
      <div className="import-remote-view-body" ref={r => this.$refs.body = r}>
        <View {...props} />
      </div>
    </div>;
  }

}

export default RemoteView;