import { ReactElement } from './ReactElement';
import { ElementType, Key, Ref, Props, ReactElementType } from 'shared/ReactTypes';

/** 
  JSX 转换示例：
	<div key="f1" id="div1" classname="style1">
		<span key="c1" id="div2" classname="style2">child1</span>
		<span key="c2">child2</span>
	</div>
	
	// automatic
	_jsxs("div", {
			id: "div1",
			classname: "style1",
			children: [_jsx("span", {
					id: "div2",
					classname: "style2",
					children: "child1"
			}, "c1"), _jsx("span", {
					children: "child2"
			}, "c2")]
	}, "f1");
*/

export const jsx = (type: ElementType, config: any, maybeKey: any): ReactElementType => {
	const props: Props = {};
	let key: Key = null;
	let ref: Ref = null;

	if (maybeKey !== undefined) {
		key = '' + maybeKey;
	}

	for (const prop in config) {
		const val = config[prop];
		if (val !== undefined && prop === 'ref') {
			ref = val;
			continue;
		}
		if ({}.hasOwnProperty.call(config, prop)) {
			props[prop] = val;
		}
	}

	return ReactElement(type, key, ref, props);
};

export const jsxDEV = jsx;
