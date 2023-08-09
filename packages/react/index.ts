import currentDispatcher, { Dispatcher, resolveDispatcher } from './src/ReactCurrentDispatcher';
import currentBatchConfig from './src/ReactCurrentBatchConfig';
import { jsx as jsxFn, isValidElement as isValidElementFn } from './src/ReactJSXElement';
import { createElement as createElementFn } from './src/ReactElement';

export const useState: Dispatcher['useState'] = (initialState) => {
  const dispatcher = resolveDispatcher();
  return dispatcher.useState(initialState);
};

export const useEffect: Dispatcher['useEffect'] = (create, deps) => {
  const dispatcher = resolveDispatcher();
  return dispatcher.useEffect(create, deps);
};

export const useTransition: Dispatcher['useTransition'] = () => {
  const dispatcher = resolveDispatcher();
  return dispatcher.useTransition();
};

// 内部数据共享层
export const __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = {
  currentDispatcher,
  currentBatchConfig,
};

export const version = '0.0.1';
export const createElement = createElementFn;
export const jsx = jsxFn;
export const isValidElement = isValidElementFn;
export { REACT_FRAGMENT_TYPE as Fragment } from 'shared/ReactSymbols';
