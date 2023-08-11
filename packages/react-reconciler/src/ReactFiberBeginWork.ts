import { ReactElementType } from 'shared/ReactTypes';
import { mountChildFibers, reconcileChildFibers } from './ReactChildFiber';
import { FiberNode } from './ReactFiber';
import { renderWithHooks } from './ReactFiberHooks';
import { processUpdateQueue, UpdateQueue } from './ReactFiberUpdateQueue';
import {
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText,
  Fragment,
  ContextProvider,
} from './ReactWorkTags';
import { Lane } from './ReactFiberLanes';
import { Ref } from './ReactFiberFlags';
import { pushProvider } from './ReactFiberContext';

export const beginWork = (wip: FiberNode, renderLane: Lane) => {
  // 比较，返回子fiberNode
  switch (wip.tag) {
    case HostRoot:
      return updateHostRoot(wip, renderLane);
    case HostComponent:
      return updateHostComponent(wip);
    case HostText:
      return null;
    case FunctionComponent:
      return updateFunctionComponent(wip, renderLane);
    case Fragment:
      return updateFragment(wip);
    case ContextProvider:
      return updateContextProvider(wip);
    default:
      if (__DEV__) {
        console.warn('beginWork未实现的类型');
      }
      break;
  }
  return null;
};

function updateContextProvider(wip: FiberNode) {
  const providerType = wip.type;
  const context = providerType._context;
  const newProps = wip.pendingProps;
  const newValue = newProps.value;

  if (__DEV__ && !('value' in newProps)) {
    console.warn('<Context.Provider>需要传递value props');
  }

  /**
   * 在bailout策略中，当shouldComponentUpdate为false时，如何感知子孙组件中有Context Consumer：
   * 1. context.value变化
   * 2. 从Provider向下DFS，寻找消费了当前变化的contexxt的consumer
   * 3. 如果找到consumer，从consumer向上便遍历到Provider
   * 4. 标记沿途组件存在更新
   */

  pushProvider(context, newValue);
  const nextChildren = newProps.children;
  reconcileChildren(wip, nextChildren);
  return wip.child;
}

function updateFunctionComponent(wip: FiberNode, renderLane: Lane) {
  const nextChildren = renderWithHooks(wip, renderLane);
  reconcileChildren(wip, nextChildren);
  return wip.child;
}

function updateFragment(wip: FiberNode) {
  const nextChildren = wip.pendingProps;
  reconcileChildren(wip, nextChildren);
  return wip.child;
}

function updateHostRoot(wip: FiberNode, renderLane: Lane) {
  const baseState = wip.memoizedState;
  const updateQueue = wip.updateQueue as UpdateQueue<Element>;
  const pending = updateQueue.shared.pending;
  updateQueue.shared.pending = null;
  // 传入的ReactElement
  const { memoizedState } = processUpdateQueue(baseState, pending, renderLane);
  wip.memoizedState = memoizedState;
  const nextChildren = wip.memoizedState;
  reconcileChildren(wip, nextChildren);
  return wip.child;
}

function markRef(current: FiberNode | null, workInProgress: FiberNode) {
  const ref = workInProgress.ref;
  if ((current === null && ref !== null) || (current !== null && current.ref !== ref)) {
    workInProgress.flags |= Ref;
  }
}

function updateHostComponent(wip: FiberNode) {
  const nextProps = wip.pendingProps;
  const nextChildren = nextProps.children;
  markRef(wip.alternate, wip);
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
