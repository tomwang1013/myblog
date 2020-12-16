---
title: webpack-hot-loader-react
categories:
  - programming
date: 2020-12-16 20:27:10
tags:
---

## 基本方式

对webpack的hot loader机制，基本用法很简单，只需要把hot开启：
```javascript
devServer: {
  hotOnly: true,
  // hot: true
}
```
然后以用`module.hot.accept`在根组件做重新渲染就行了：
```javascript
// App.tsx
import React from "react";
function App() {
  return (
    <div className='hello'>
      Hello, webpack!
    </div>
  );
};

export default App;
```

```javascript
// index.tsx
import React from 'react';
import ReactDom from 'react-dom';
import App from './App';

const render = (Component: () => JSX.Element) => {
  ReactDom.render(
    <Component />,
    document.getElementById('app')
  );
}

render(App);

if (module.hot) {
  module.hot.accept(['./App'], function () {
    const App = require('./App').default;
    render(App);
  })
}
```

## 利用react-hot-loader保持组件状态

上面的方式有个问题：组件hot load重新渲染之后状态丢失了，这个时候可以使用`react-hot-loader`
这个包，用法如下，需要改动几个地方：

```javascript
// 1. babel.config.js
{
  "plugins": [
    "react-hot-loader/babel"
  ],
}
```

```javascript
// 2. App.tsx
import React from "react";
import { hot } from 'react-hot-loader/root'
function App() {
  return (
    <div className='hello'>
      Hello, webpack!
    </div>
  );
};

export default hot(App);
```

```javascript
// 3. package.json
{
  "dependencies": {
    "react-hot-loader": "^4.13.0",
    "@hot-loader/react-dom": "^17.0.1"
  }
}
```

```javascript
// 4. webpack.config.js
{
  resolve: {
    alias: {
      'react-dom': '@hot-loader/react-dom'
    }
  }
}
```