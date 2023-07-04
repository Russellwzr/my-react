import {
  appendChildToContainer,
  insertChildToContainer,
  Container,
  Instance,
  commitUpdate,
  removeChild,
} from 'hostConfig';
import { FiberNode, FiberRootNode } from './ReactFiber';
import { MutationMask, NoFlags, Placement, ChildDeletion, Update } from './ReactFiberFlags';
import { HostComponent, HostRoot, HostText, FunctionComponent, Fragment } from './ReactWorkTags';

let nextEffect: FiberNode | null = null;

export const commitMutationEffects = (finishedWork: FiberNode) => {
  nextEffect = finishedWork;

  while (nextEffect !== null) {
    // 向下遍历
    const child: FiberNode | null = nextEffect.child;

    if ((nextEffect.subtreeFlags & MutationMask) !== NoFlags && child !== null) {
      nextEffect = child;
    } else {
      // 向上遍历 DFS
      while (nextEffect !== null) {
        commitMutaitonEffectsOnFiber(nextEffect);
        const sibling: FiberNode | null = nextEffect.sibling;

        if (sibling !== null) {
          nextEffect = sibling;
          break;
        }
        nextEffect = nextEffect.return;
      }
    }
  }
};

const commitMutaitonEffectsOnFiber = (finishedWork: FiberNode) => {
  const flags = finishedWork.flags;

  if ((flags & Placement) !== NoFlags) {
    commitPlacement(finishedWork);
    finishedWork.flags &= ~Placement;
  }
  if ((flags & Update) !== NoFlags) {
    commitUpdate(finishedWork);
    finishedWork.flags &= ~Update;
  }
  if ((flags & ChildDeletion) !== NoFlags) {
    const deletions = finishedWork.deletions;
    if (deletions !== null) {
      deletions.forEach((childToDelete) => {
        commitDeletion(childToDelete);
      });
    }
    finishedWork.flags &= ~ChildDeletion;
  }
};

const commitPlacement = (finishedWork: FiberNode) => {
  if (__DEV__) {
    console.warn('执行Placement操作', finishedWork);
  }
  // parent DOM
  const hostParent = getHostParent(finishedWork);

  // host sibling
  const sibling = getHostSibling(finishedWork);

  // finishedWork ~~ DOM append parent DOM
  if (hostParent !== null) {
    insertOrAppendPlacementNodeIntoContainer(finishedWork, hostParent, sibling);
  }
};

function getHostSibling(fiber: FiberNode) {
  let node: FiberNode = fiber;

  findSibling: while (true) {
    while (node.sibling === null) {
      const parent = node.return;

      if (parent === null || parent.tag === HostComponent || parent.tag === HostRoot) {
        return null;
      }
      node = parent;
    }
    node.sibling.return = node.return;
    node = node.sibling;

    while (node.tag !== HostText && node.tag !== HostComponent) {
      // 向下遍历
      if ((node.flags & Placement) !== NoFlags) {
        continue findSibling;
      }
      if (node.child === null) {
        continue findSibling;
      } else {
        node.child.return = node;
        node = node.child;
      }
    }

    if ((node.flags & Placement) === NoFlags) {
      return node.stateNode;
    }
  }
}

/* 
  删除Fragment后，子树的根Host节点可能存在多个，如下：
  <div>
    <>
      <li>item-1</li>
      <>
        <li>item-2</li>
        <>
          <li>item-3</li>
          <li>item-4</li>
        </>
        <li>item-5</li>
      </>
      <li>item-6</li>
    </>
  </div>
*/
function recordHostChildrenToDelete(beginNode: FiberNode): FiberNode[] {
  if (beginNode.tag !== Fragment) return [beginNode];
  const hostChildrenToDelete: FiberNode[] = [];
  const processQueue: FiberNode[] = [beginNode];
  // BFS标记各层Fragment下需要删除的元素
  while (processQueue.length) {
    const node = processQueue.shift();
    if (node && node.tag !== Fragment) {
      hostChildrenToDelete.push(node);
      continue;
    }
    let childNode = node?.child;
    while (childNode) {
      processQueue.push(childNode);
      childNode = childNode.sibling;
    }
  }
  return hostChildrenToDelete;
}

function commitDeletion(childToDelete: FiberNode) {
  const hostChildrenToDelete: FiberNode[] = recordHostChildrenToDelete(childToDelete);

  for (let i = 0; i < hostChildrenToDelete.length; i++) {
    commitNestedComponent(hostChildrenToDelete[i], (unmountFiber) => {
      switch (unmountFiber.tag) {
        case HostComponent:
          // TODO 解绑ref
          return;
        case HostText:
          return;
        case FunctionComponent:
          // TODO useEffect unmount 、解绑ref
          return;
        default:
          if (__DEV__) {
            console.warn('未处理的unmount类型', unmountFiber);
          }
      }
    });
  }

  if (hostChildrenToDelete.length) {
    const hostParent = getHostParent(childToDelete) as Container;
    if (hostParent !== null) {
      hostChildrenToDelete.forEach((hostChild) => {
        removeChild(hostChild.stateNode, hostParent);
      });
    }
  }

  childToDelete.return = null;
  childToDelete.child = null;
}

function commitNestedComponent(root: FiberNode, onCommitUnmount: (fiber: FiberNode) => void) {
  let node = root;
  while (true) {
    onCommitUnmount(node);

    if (node.child !== null) {
      // 向下遍历
      node.child.return = node;
      node = node.child;
      continue;
    }
    if (node === root) {
      // 终止条件
      return;
    }
    while (node.sibling === null) {
      if (node.return === null || node.return === root) {
        return;
      }
      // 向上归
      node = node.return;
    }
    node.sibling.return = node.return;
    node = node.sibling;
  }
}

function getHostParent(fiber: FiberNode): Container | null {
  let parent = fiber.return;

  while (parent) {
    const parentTag = parent.tag;
    // HostComponent HostRoot
    if (parentTag === HostComponent) {
      return parent.stateNode as Container;
    }
    if (parentTag === HostRoot) {
      return (parent.stateNode as FiberRootNode).container;
    }
    parent = parent.return;
  }
  if (__DEV__) {
    console.warn('未找到host parent');
  }
  return null;
}

function insertOrAppendPlacementNodeIntoContainer(
  finishedWork: FiberNode,
  hostParent: Container,
  before?: Instance,
) {
  // fiber host
  if (finishedWork.tag === HostComponent || finishedWork.tag === HostText) {
    if (before) {
      insertChildToContainer(finishedWork.stateNode, hostParent, before);
    } else {
      appendChildToContainer(hostParent, finishedWork.stateNode);
    }
    return;
  }
  const child = finishedWork.child;
  if (child !== null) {
    insertOrAppendPlacementNodeIntoContainer(child, hostParent, before);
    let sibling = child.sibling;

    while (sibling !== null) {
      insertOrAppendPlacementNodeIntoContainer(sibling, hostParent, before);
      sibling = sibling.sibling;
    }
  }
}
