import React from 'react';
import { innumerable } from './utils';

function createApp(view, options = {}) {
  class RemoteViewApp extends React.Component {

    constructor(props) {
      super(props);
      if (view.bootstrap) view.bootstrap(props, options);
    }

    get root() {
      const { shadow } = options;
      if (shadow && !this.shadowEl && this.el && (this.el.attachShadow || this.el.createShadowRoot)) {
        this.shadowEl = this.el.attachShadow
          ? this.el.attachShadow({ mode: 'open' })
          : this.el.createShadowRoot();
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
        const prom = view.mounted(this.root, props);
        if (prom && prom.then) {
          prom.then(() => view.update && view.update(this.root, props, null));
        } else view.update && view.update(this.root, props, null);
      } else if (view.init) {
        const prom = view.init(props, options);
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
      else if (view.init) view.init(newProps);
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
  RemoteViewApp.__import_remote_app__ = true;

  return RemoteViewApp;  
}

export default createApp;