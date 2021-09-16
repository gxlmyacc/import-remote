import React from 'react';
import { innumerable, supportShadow, createShadowRoot, isReactComponent, isForwardComponent } from './utils';
import remote from '../..';

function createAppView(view, options = {}) {
  if (view && view.__esModule) view = view.default;
  if (!view) return null;
  if (typeof view === 'function' || isReactComponent(view) || isForwardComponent(view)) {
    return view;
  }
  class RemoteAppView extends React.Component {

    constructor(props) {
      super(props);
      if (view.bootstrap) view.bootstrap(props, options);
    }

    get root() {
      const { shadow } = options;
      if (shadow && !this.shadowEl && supportShadow) {
        this.shadowEl = createShadowRoot(this.el);
      }
      return shadow
        ? (this.shadowEl || this.el)
        : this.el;
    }

    _getAppProps(props) {
      const { id, className, style, ...otherProps } = props;
      if (props.children) innumerable(otherProps, 'children', props.children);
      return { id, className, style, otherProps };
    }

    componentDidMount() {
      let props = this._getAppProps(this.props).otherProps;
      if (view.mounted) {
        return view.mounted(this.root, props);
      }
      if (view.init || view.forceInit) {
        const prom = (view.init || view.forceInit)(props, options);
        if (prom && prom.then) {
          prom.then(() => view.render && view.render(this.root, props));
        } else view.render && view.render(this.root, props);
      }
    }

    componentWillUnmount() {
      if (view.unmount) view.unmount(this.root);
      else if (view.destroy) view.destroy(this.root);
      else if (view.destory) view.destory(this.root);
    }

    componentDidUpdate(prevProps) {
      let newProps = this._getAppProps(this.props).otherProps;
      let oldProps = this._getAppProps(prevProps).otherProps;
      if (view.update) view.update(this.root, newProps, oldProps);
      else if (view.mounted) view.mounted(this.root, newProps);
      else if (view.init || view.forceInit) (view.init || view.forceInit)(newProps);
    }

    render() {
      let props = { className: 'import-remote-app' };
      if (view.inheritAttrs !== false) {
        const { id, className, style } = this._getAppProps(this.props);
        Object.assign(props, { id, style });
        if (className) props.className += ` ${className}`;
      }
      return React.createElement('div', {
        ...props,
        ref: el => this.el = el
      });
    }

  }
  RemoteAppView.__import_remote_app__ = true;

  return RemoteAppView;
}

function requireApp(url, options = {}) {
  return remote(url, options).then(view => createAppView(view, options));
}

export {
  createAppView
};

export default requireApp;
