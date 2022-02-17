import React from 'react';
import { RemoteModule } from '../../types';

interface RemoteAppViewProp extends React.HTMLAttributes {
  [key: string]: any
}

type RemoteAppViewState = {
}

declare class RemoteAppView<P = RemoteAppViewProp, S = RemoteAppViewState, SS = any> extends React.Component<P, S, SS> {
  readonly root: HTMLElement
  readonly __import_remote_app__: true

  componentDidMount(): Promise<void>;
  componentWillUnmount(): void;
  componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot?: SS): void;

  _getAppProps(): {
    id?: string
    className?: string,
    style?: React.CSSProperties,
    otherProps: Record<string, any>,
  }

  render(): React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.FunctionComponentElement<any> | null;
}

type RemoteAppOptions = {
  shadow?: boolean,
  [key: string]: any
}

type AppView<P = Record<string, any>, O = Record<string, any>> = {
  inheritAttrs?: boolean,

  bootstrap?(props: P, options: O);

  mounted?(root: HTMLElement, props: P);
  init?(root: HTMLElement, props: P);
  forceInit?(root: HTMLElement, props: P);

  update?(root: HTMLElement, newProps: Partial<P>, oldProps: Partial<P>);

  unmount?(root: HTMLElement);
  destroy?(root: HTMLElement);
  destory?(root: HTMLElement);
}

declare function createAppView(
  view: AppView | React.ComponentType,
  options?: RemoteAppOptions
): RemoteAppView | React.ComponentType;

declare function requireApp(
  url: string,
  options?: RemoteAppOptions
): RemoteAppView;

interface RemoteAppProps extends React.HTMLAttributes {
  src?: string,
  module?: RemoteModule,
  moduleName?: string,
  exportName?: string,
  hoc?: (Component: React.ComponentType | React.ForwardRefExoticComponent, error?: any) => React.ComponentType | React.ForwardRefExoticComponent,
  children?: React.ReactNode,
  clearWhenError?: boolean,
  props?: Record<string, any>
  [key: string]: any
}

declare const RemoteApp: React.ForwardRefExoticComponent<
  Pick<RemoteAppProps, string | number> & React.RefAttributes<unknown>
>;

export {
  createAppView,
  RemoteApp,
  RemoteAppProps
}

export default requireApp;
