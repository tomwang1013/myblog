---
title: Same-origin policy(SOP)和Content Security Policy(CSP)拾遗
categories:
  - programming
date: 2018-11-21 10:46:40
tags:
  - security
  - http
---

# SOP

浏览器的同源策略(Same-origin policy，下面简称**SOP**)用来控制document及其里面的script如何访问不同域的资源，政策大家都听过，但是细节很多，这里做个总结备忘

## cross-site ajax request

跨域ajax请求，毫无疑问是被阻止的，这也是我们对SOP的第一印象

## cross-site script API access

跨域访问另一个文档的内容，也是被阻止的

但是，我们可以拿到另一个文档的window对象，这个对象暴露了很有限的属性或方法可以访问：

The following cross-origin access to these `Window` properties is allowed:

| Methods                                                      |
| ------------------------------------------------------------ |
| [`window.blur`](https://developer.mozilla.org/en-US/docs/Web/API/Window/blur) |
| [`window.close`](https://developer.mozilla.org/en-US/docs/Web/API/Window/close) |
| [`window.focus`](https://developer.mozilla.org/en-US/docs/Web/API/Window/focus) |
| [`window.postMessage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) |

| Attributes                                                   |             |
| ------------------------------------------------------------ | ----------- |
| [`window.closed`](https://developer.mozilla.org/en-US/docs/Web/API/Window/closed) | Read only.  |
| [`window.frames`](https://developer.mozilla.org/en-US/docs/Web/API/Window/frames) | Read only.  |
| [`window.length`](https://developer.mozilla.org/en-US/docs/Web/API/Window/length) | Read only.  |
| [`window.location`](https://developer.mozilla.org/en-US/docs/Web/API/Window/location) | Read/write. |
| [`window.opener`](https://developer.mozilla.org/en-US/docs/Web/API/Window/opener) | Read only.  |
| [`window.parent`](https://developer.mozilla.org/en-US/docs/Web/API/Window/parent) | Read only.  |
| [`window.self`](https://developer.mozilla.org/en-US/docs/Web/API/Window/self) | Read only.  |
| [`window.top`](https://developer.mozilla.org/en-US/docs/Web/API/Window/top) | Read only.  |
| [`window.window`](https://developer.mozilla.org/en-US/docs/Web/API/Window/window) | Read only.  |

## Cross-origin network access

和js发起的请求不一样，浏览器自动发起的跨域请求很多情况下是允许的，如：

- Cross-origin *writes*：如链接(link)、重定向(redirect)及表单提交(form submission)
- Cross-origin *embedding*：资源嵌套，如：
  - `<script src="..."></script>`
  - `<link rel="stylesheet" href="…">`
  - `<img>`
  - `<video>`和`<audio>`
  - 插件嵌入：`<object>`, `<embed>`, `<applet>`
  - `@font-face`引入的字体文件(有些浏览器不允许)
  - `<iframe src="...">`(可以使用[X-Frame-Options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options)来阻止页面被嵌入其他网站)
- Cross-origin *reads*：和embedding不一样，这个不是为了将资源展示出来，而是为了读取资源的内容，比如说我在img标签中将src设置为一个html或json文档。现在浏览器已经做了[一些事](https://www.chromium.org/Home/chromium-security/corb-for-developers)来阻止这种行为

### 如何允许跨域访问

 [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

### 如何阻止跨域访问

CSRF token

## Cross-origin data storage access

1. 对localStorage(包括sessionStorage)和indexDB来说，它们是严格按origin划分的。一个origin中的js不能访问另一个origin中的存储

2. 对cookie来说，情况稍微有点不同：

   1. 我们创建一个cookie时，cookie.domain可以设置成当前domain或当前domain的父domain

   2. 我们给cookie设置一个domain，这个cookie对所有子domain也是可见的：For example, if `Domain=mozilla.org` is set, then cookies are included on subdomains like `developer.mozilla.org`。

      If domain is not unspecified, it defaults to the host of the current document location, **excluding subdomains**. If `Domain` *is* specified, then subdomains are always included.

# CSP

Content Security Policy(下面简称CSP)是浏览器用来控制页面上所有资源(js, css, img, etc)的来源，初衷是为了减少页面受攻击的可能性。比如XSS攻击是用户不小心执行了攻击者放入页面的脚本，用CSP我们可以限制页面上js的来源，这样我们只能执行特定来源的js从而使得这种攻击不会发生

## 使用

使用CSP很简单，只需由web server在响应头中指定[Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy)头，格式如下：

```javascript
Content-Security-Policy: policy
```

这里的policy就可以控制各个资源的加载，举个例子：

```
Content-Security-Policy: default-src 'self'; img-src *; media-src media1.com 		
	media2.com; script-src userscripts.example.com
```

这个policy说明了：

- 默认情况下，资源只能从本地加载(default-src 'self')
- 图片能从任何地方加载(img-src *)
- 音视频只能从media1.com media2.com这两个地方加载
- 只执行从userscripts.example.com加载的js脚本(script-src userscripts.example.com)



参考文档：

https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy

https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP

https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies