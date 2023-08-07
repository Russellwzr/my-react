/**
 * Reference:
 * https://juejin.cn/post/7046217872833511454
 * https://github.com/facebook/react/tree/main/packages/scheduler
 */
import {
  //空闲优先级
  unstable_IdlePriority as IdlePriority,
  //低优先级
  unstable_LowPriority as LowPriority,
  //普通优先级
  unstable_NormalPriority as NormalPriority,
  //用户阻塞优先级
  unstable_UserBlockingPriority as UserBlockingPriority,
  //立刻执行的优先级
  unstable_ImmediatePriority as ImmediatePriority,
  // 当某一个任务正在被调度，但还没被执行时，可使用该函数进行取消
  unstable_cancelCallback as cancelCallback,
  // 用于调度perform方法
  unstable_scheduleCallback as scheduleCallback,
  // 当前帧是否用尽, 用尽了为true，此时需要中断任务
  unstable_shouldYield as shouldYield,
  // 返回当前正在调度的任务
  unstable_getFirstCallbackNode as getFirstCallbackNode,
  // unstable_scheduleCallback的返回值
  CallbackNode,
} from 'scheduler';
import './style.css';

type Priority =
  | typeof IdlePriority
  | typeof LowPriority
  | typeof NormalPriority
  | typeof UserBlockingPriority
  | typeof ImmediatePriority;

interface Work {
  count: number;
  priority: Priority;
}

const root = document.querySelector('#root');
const workList: Work[] = [];
let prevPriority: Priority = IdlePriority;
let curCallback: CallbackNode | null = null;

[LowPriority, NormalPriority, UserBlockingPriority, ImmediatePriority].forEach((priority) => {
  const btn = document.createElement('button');
  root?.appendChild(btn);
  btn.innerText = [
    '',
    'ImmediatePriority',
    'UserBlockingPriority',
    'NormalPriority',
    'LowPriority',
  ][priority];
  btn.onclick = () => {
    workList.unshift({
      count: 100,
      priority: priority as Priority,
    });
    schedule();
  };
});

function schedule() {
  const cbNode = getFirstCallbackNode();
  const curWork = workList.sort((w1, w2) => w1.priority - w2.priority)[0];

  if (!curWork) {
    curCallback = null;
    cbNode && cancelCallback(cbNode);
    return;
  }

  const { priority: curPriority } = curWork;
  // 优先级相同，不需要开启新的调度
  if (curPriority === prevPriority) {
    return;
  }

  // 出现更高优先级的work，取消当前的回调
  cbNode && cancelCallback(cbNode);

  curCallback = scheduleCallback(curPriority, perform.bind(null, curWork));
}

function perform(work: Work, didTimeout?: boolean) {
  /**
   * 中断的条件：
   * 1. 任务优先级
   * 2. 饥饿问题
   * 3. 时间切片
   */
  const needSync = work.priority === ImmediatePriority || didTimeout || !shouldYield();
  while (needSync && work.count) {
    // 执行当前任务
    work.count--;
    insertSpan(work.priority + '');
  }

  prevPriority = work.priority;

  // 当前任务执行完成
  if (!work.count) {
    const workIndex = workList.indexOf(work);
    workList.splice(workIndex, 1);
    prevPriority = IdlePriority;
  }

  const prevCallback = curCallback;
  schedule();
  const newCallback = curCallback;

  if (newCallback && prevCallback === newCallback) {
    // 如果调度的回调函数的返回值是函数，则会继续调度返回的函数，即继续调度当前任务
    return perform.bind(null, work);
  }
}

function insertSpan(content) {
  const span = document.createElement('span');
  span.innerText = content;
  span.className = `pri-${content}`;
  doSomeBusyWork(10000000);
  root?.appendChild(span);
}

function doSomeBusyWork(len: number) {
  let result = 0;
  while (len--) {
    result += len;
  }
}
