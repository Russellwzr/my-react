import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';
import { ElementType, Key, Ref, Props, ReactElementType } from 'shared/ReactTypes';

export const ReactElement = function (
	type: ElementType,
	key: Key,
	ref: Ref,
	props: Props,
): ReactElementType {
	const element = {
		$$typeof: REACT_ELEMENT_TYPE,
		type,
		key,
		ref,
		props,
		__mark: 'my-react',
	};
	return element;
};

/** 
  JSX 转换示例：
	<div key="f1" id="div1" classname="style1">
		<span key="c1" id="div2" classname="style2">child1</span>
		<span key="c2">child2</span>
	</div>
	
  // classic
  React.createElement("div", {
      key: "f1",
      id: "div1",
      classname: "style1"
  }, React.createElement("span", {
      key: "c1",
      id: "div2",
      classname: "style2"
  }, "child1"), React.createElement("span", {
      key: "c2"
  }, "child2"));
*/

export const createElement = (
	type: ElementType,
	config: any,
	...childList: any
): ReactElementType => {
	const props: Props = {};
	let key: Key = null;
	let ref: Ref = null;

	for (const prop in config) {
		const val = config[prop];
		if (val !== undefined && prop === 'key') {
			key = '' + val;
			continue;
		}
		if (val !== undefined && prop === 'ref') {
			ref = val;
			continue;
		}
		// hasOwnProperty判断对象自有属性（而不是继承来的属性）中是否具有指定的属性
		if ({}.hasOwnProperty.call(config, prop)) {
			// 仅处理自身属性
			props[prop] = val;
		}
	}

	if (childList?.length) {
		props.children = childList?.length === 1 ? childList[0] : childList;
	}

	return ReactElement(type, key, ref, props);
};
