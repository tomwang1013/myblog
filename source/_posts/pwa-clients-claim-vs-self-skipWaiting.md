---
title: service worker之clients.claim() vs self.skipWaiting()
categories:
  - programming
date: 2018-10-25 17:20:09
tags:
  - html5
  - pwa
---

service worker中有两个api出镜率很高：一个是`clients.claim()`, 另一个是`self.skipWaiting()`，我们分别看看它们的应用场景：

# clients.claim

当页面第一次注册sw的时候，我们注意到即使此页面及其子页面处于sw的控制范围之内，但是由此页面发出的任务请求都没有经过sw，换句话说，sw在页面第一次打开的时候并没有生效。这是一个**正常**行为，原因如下：

> if your page loads without a service worker, neither will its subresources

就是说，如果页面自身的加载没有经过sw，那么它发出的所有请求也不会经过sw，这很正常，毕竟这只和首次加载有关，且即使没有sw应该也能工作良好。

如果你想改变这种情况，系统也提供了api，这就是`clients.claim`，你可以在sw的`activate`事件处理中调用，让sw马上生效，这样注册页面发出的请求在第一次页面加载的时候就会经过sw：

```javascript
// sw.js
self.addEventListener('activate', e => {
  console.log('Service worker activating...')
  
  clients.claim();
})
```

# self.skipWaiting

我们知道，当sw更新的时候如果前一版本的sw还在工作，新的sw会等待，处于waiting状态知道所有被老的sw控制的页面都关闭，这也是**正常**行为，有利于保证应用状态的一致性。

如果你想新的sw马上取代老的进入工作状态(即进入`activate`状态)，你可以在`install`事件处理中调用`self.skipWaiting`：

```javascript
self.addEventListener('install', e => {
  console.log('Service worker installing...')
  self.skipWaiting();
})
```

