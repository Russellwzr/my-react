import { ReactElementType } from 'shared/ReactTypes';
import { mountChildFibers, reconcileChildFibers } from './ReactChildFiber';
import { FiberNode } from './ReactFiber';
import { renderWithHooks } from './ReactFiberHooks';
import { processUpdateQueue, UpdateQueue } from './ReactFiberUpdateQueue';
import { FunctionComponent, HostComponent, HostRoot, HostText } from './ReactWorkTags';

export const beginWork = (wip: FiberNode) => {
  // 比较，返回子fiberNode
  switch (wip.tag) {
    case HostRoot:
      return updateHostRoot(wip);
    case HostComponent:
      return updateHostComponent(wip);
    case HostText:
      return null;
    case FunctionComponent:
      return updateFunctionComponent(wip);
    default:
      if (__DEV__) {
        console.warn('beginWork未实现的类型');
      }
      break;
  }
  return null;
};

function updateFunctionComponent(wip: FiberNode) {
  const nextChildren = renderWithHooks(wip);
  reconcileChildren(wip, nextChildren);
  return wip.child;
}

function updateHostRoot(wip: FiberNode) {
  const baseState = wip.memoizedState;
  const updateQueue = wip.updateQueue as UpdateQueue<Element>;
  const pending = updateQueue.shared.pending;
  updateQueue.shared.pending = null;
  // 传入的ReactElement
  const { memoizedState } = processUpdateQueue(baseState, pending);
  wip.memoizedState = memoizedState;
  const nextChildren = wip.memoizedState;
  reconcileChildren(wip, nextChildren);
  return wip.child;
}

function updateHostComponent(wip: FiberNode) {
  const nextProps = wip.pendingProps;
  const nextChildren = nextProps.children;
  reconcileChildren(wip, nextChildren);
  return wip.child;
}

function reconcileChildren(wip: FiberNode, children?: ReactElementType) {
  const current = wip.alternate;
  if (current !== null) {
    // update
    wip.child = reconcileChildFibers(wip, current?.child, children);
  } else {
    // mount
    wip.child = mountChildFibers(wip, null, children);
  }
}