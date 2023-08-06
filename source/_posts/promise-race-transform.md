---
title: Promise.race一种变形：any resolve => resolve, all reject => reject实现
date: 2018-5-12 12:49:24
categories:
- programming
tags: 
- es6
- promise
---

我们知道，`pr = Promise.race[promises]`的意思是promises中任何一个resolve会导致pr变成resolve，任何一个reject会导致pr变成reject，但是有时候我们需要这样的逻辑：resolve和race一样，但是必须是promises中所有的都是reject，pr才变成reject，该怎么办？偶然在网上看到一个实现，很精妙，估记录一下：

```javascript
// Promise.race is no good to us because it rejects if
// a promise rejects before fulfilling. Let's make a proper
// race function:
function promiseAny(promises) {
  return new Promise((resolve, reject) => {
    // make sure promises are all promises
    promises = promises.map(p => Promise.resolve(p));
      
    // resolve this promise as soon as one resolves
    promises.forEach(p => p.then(resolve));
      
    // reject if all promises reject
    promises.reduce((a, b) => a.catch(() => b))
      .catch(() => reject(Error("All failed")));
  });
};
```

这里的关键是`reduce`语句，假设我们传进来的`promises`是`[a, b, c, d]`，这条语句等价于：

```javascript
a.catch(() => b).catch(() => c).catch(() => d)
  .catch(() => reject(Error("All failed")));
```

如果最后一个catch被执行，说明前面所有的catch都被执行了，而前面的catch函数都是返回下一个promise，这说明每个promise都是reject状态

## 更新

最新的Promise规范已经包含这个方法了: [Promise.any](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/any)