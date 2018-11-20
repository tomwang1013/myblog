---
title: webpack sideEffects选项简介
categories:
  - programming
date: 2018-11-20 16:51:45
tags:
  - webpack
---

webpack的`sideEffects`选项和[tree shaking](https://webpack.js.org/guides/tree-shaking/)有关，按照官方文档我测试了下这个选项对打包代码的影响，示例代码如下：

```javascript
// math.js
export function square(x) {
  return x * x;
}

console.log('math has side effects')

export function cube(x) {
  return x * x * x;
}
```

```javascript
// index.js
import { cube, square } from './math.js';

function component() {
  var element = document.createElement('pre');

  element.innerHTML = [
    'Hello webpack!',
    '5 cubed is equal to 125'/*  + cube(5) */
  ].join('\n\n');

  return element;
}

document.body.appendChild(component());
```

index.js虽然import了math.js，但是没有用到import进来的方法，按我们的理解最终math.js的代码最终会打包进来，下面分三种情况做下测试：

1. sideEffects不设置，看默认情况

   只有`console.log("math has side effects");`这句代码被打包进来，math.js中的其他两个函数都没有打包

   看来webpack已经很智能了：即使你引入了，只要没使用都不会打包进来

2. sideEffects: false

   math中的任何代码都没有打进来，和预期的一致：这个选项告诉webpack，我的文件没有任何*副作用*

3. sideEffects: ["./src/math.js"]

   和第一种情况一样：这里显式指明有副作用的文件，这样webpack会把文件中没有用到的代码也打包进来

**总结：**

即使你不做任何事情，webpack的tree shaking机制也已经在起作用了，并且作用得很好

注意：此处我们用的是webpack 4，它在production环境下会自动开启minification和tree shaking机制