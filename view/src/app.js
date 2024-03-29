import React, { useState, useEffect, useMemo } from 'react';
import { innumerable, supportShadow, createShadowRoot, isReactComponent, isForwardComponent } from './utils';
import remote from '../..';

function createAppView(view, options = {}) {
  if (view && view.__esModule) view = view[options.exportName || 'default'];
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

const RemoteApp = React.forwardRef(
  /**
   * @param {import('../types/app').RemoteAppProps} props
   * @param {*} ref
   */
  (props, ref) => {
    const {
      src = '', module, moduleName, exportName = 'default', hoc, children,
      clearWhenError = true, style = {},
      showChildren,
      ...restProps
    } = props;
    const [app, setApp] = useState({ App: null });

    const [$refs] = useState({});
    const App = app.App;

    $refs.hoc = hoc;
    $refs.clearWhenError = clearWhenError;

    useEffect(() => {
      if (!src && (!module || !moduleName)) return;
      (src
        ? remote(src)
        : module.require(moduleName))
        .then(esModule => {
          let App = createAppView(esModule.__esModule
            ? esModule[exportName]
            : esModule);

          if ($refs.hoc) App = $refs.hoc(App);

          setApp({ App });
        }).catch(e => {
          if ($refs.clearWhenError) {
            let App = ($refs.hoc && $refs.hoc(null, e)) || null;
            setApp({ App });
          }
          return e;
        });
    }, [src, module, moduleName, exportName, $refs]);

    const displayStyle = useMemo(() => {
      if ($refs.App) return style;

      const _style = { ...style };
      if (restProps.height && !_style.height) _style.height = restProps.height;
      if (restProps.width && !_style.width) _style.width = restProps.width;
      return _style;
    }, [$refs.App, style, restProps.height, restProps.width]);

    return App
      ? React.createElement(
        App,
        {
          ...(ref ? { ref } : {}),
          style: displayStyle,
          ...restProps
        },
        children
      )
      : children && (!Array.isArray(children) || children.length)
        ? React.createElement(
          'i',
          {
            className: restProps.className,
            style: {
              ...displayStyle,
              visibility: 'hidden',
            }
          },
          showChildren ? children : null
        )
        : null;
  }
);

function createModuleApp(remoteModule, initProps = {}) {
  const RemoteAppWrapper = React.forwardRef((props, ref) => React.createElement(RemoteApp, {
    module: remoteModule,
    ...initProps,
    ...(ref ? { ref } : {}),
    ...props
  }, props.children));
  return RemoteAppWrapper;
}

export {
  createAppView,
  createModuleApp,
  RemoteApp
};

export default requireApp;
