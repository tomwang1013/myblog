---
title: PWA之存储简介
date: 2018-10-12 21:20:44
tags:
  - pwa
  - storage
---

浏览器端有多种存储方式，作为PWA程序该如何选择离线存储方式呢？首先我们看看典型的web程序有哪些数据需要存储。浏览器端的数据分两类：

1. 静态资源：如html，css，js，image等和某个URL关联的请求资源
2. 动态数据：如动态请求后端接口返回的一些状态信息等，通常是ajax请求返回的

总结来看：

1. 对静态资源(URL addressable resources)，我们使用[Cache Api](https://developers.google.com/web/fundamentals/instant-and-offline/web-storage/cache-api)
2. 对动态数据，我们使用[IndexDB](https://developers.google.com/web/ilt/pwa/working-with-indexeddb)

下面我们依次介绍并比较一下所有浏览器端的存储方式：

1. Cookies
   - sync
   - 不支持web worker及service worker
   - 储存量很有限，且只能存string类型
2. Session Storage & Local Storage
   - sync
   - 不支持web worker及service worker
   - 储存量很有限，且只能存string类型
3. Cache API
   - async (Promise-based)
   - 支持Windows, Workers, Service Workers
   - key = Request, value = Response
   - 储存类型不限
4. IndexDB
   - async (event based)
   - 支持Windows, Workers, Service Workers
   - 支持索引(indexed)、事务(transactions)、游标(cursors)
   - 储存类型不限
   - Not SQL，很低层，一般使用封装好的基于promised的库，如[idb](https://github.com/jakearchibald/idb)
5. ~~File System~~：只有chrome支持，不考虑
6. ~~WebSQL~~：Rejected by Edge, Firefox，不考虑
7. ~~App Cache~~：废弃

前面没有提到Cache API和IndexDB的储存大小限制，其实他们也有限制，只是上限远高于Cookies和LocalStorage，但是具体的限制却有点复杂，且每个浏览器都不一样，这里有个大概的数据：

| Browser | Limit                                                        |
| ------- | ------------------------------------------------------------ |
| Chrome  | <6% of free space                                            |
| Firefox | <10% of free space                                           |
| Safari  | <50MB                                                        |
| IE10    | <250MB                                                       |
| Edge    | [Dependent on volume size](https://developer.microsoft.com/en-us/microsoft-edge/platform/documentation/dev-guide/storage/IndexedDB/) |

参考：

https://developers.google.com/web/fundamentals/instant-and-offline/web-storage/

https://docs.google.com/presentation/d/11CJnf77N45qPFAhASwnfRNeEMJfR-E_x05v1Z6Rh5HA/edit#slide=id.g146417e51d_0_113

