import React from 'react';
import RemoteModule from '../../types/module';

type RemoteViewProp = {
  id?: string
  className?: string,
  style?: React.CSSProperties,
  disabled?: boolean,

  bodyStyle?: React.CSSProperties,
  scopeStyle?: boolean|'always',
  scopePrefix?: string,
  classPrefix?: string,
  transfromHtmlBodyTagClass?: boolean,
  shadow?: boolean,
  tag?: string,
  src?: string,
  module?: RemoteModule,
  moduleName?: string,
  exportName?: string,
  props?: Record<string, any>,
  externals?: Record<string, any>,
  onViewLoading?: (loading: boolean) => void
  onViewError?: (ex: Error) => void
}

type RemoteViewState = {
  loading: boolean,
  viewSrc: string,
  view: any
}

declare class RemoteView<P = RemoteViewProp, S = RemoteViewState, SS = any> extends React.Component<P, S, SS> {
  componentDidMount(): Promise<void>;
  componentWillUnmount(): void;
  componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot?: SS): void;

  reload(): void;
  _destoryView(viewScopeName: string): void;
  _loadView(): void;

  render(): React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.FunctionComponentElement<any> | null;
}

export default RemoteView;
