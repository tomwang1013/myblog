## javascript优化之tree shaking

简单地说，`tree shaking`就是不要将用不到的代码打包进来，举个例子，下面的文件定义了2个函数：

```javascript
// util.js
export function f1() {
    // ...
}

export function f2() {
    // ...
}
```

主模块只用到了其中一个函数：

```javascript
// main.js

import * as util from 'util.js'
util.f1()
```

`f2`虽然没有被用到，但是打包的时候依然会包含进来，导致js文件变大。在webpack中，tree shaking是自动开启的，但是为了让它真正生效，需要你在其他方面稍微配合一下：

### 只import你需要的代码

```javascript
// main.js

import { f1 } from 'util.js'
util.f1()
```

### 阻止babel将es6 module编译成commonJS

webpack的tree shaking只对es6 module其作用，所以我们要阻止babel先做转化：

```javascript
{
  "presets": [
    ["env", {
      "modules": false
    }]
  ]
}
```

### 设置sideEffects标记

有些模块的作用不是为了导出东西供其他模块使用，而是在被导入的时候做点其他事(如各种polyfills)，我们称这种模块是有**副作用（side effects）**，这种模块是不能移除的，这就是`sideEffects`的作用，它用来告诉一个包或项目中哪些文件具有副作用，需要在模块或项目的`package.json`中指定：

- 所有文件都没有副作用

  ```javascript
  {
    "name": "webpack-tree-shaking-example",
    "version": "1.0.0",
    "sideEffects": false
  }
  ```

- 某些文件具有副作用：

  ```javascript
  {
    "name": "your-project",
    "sideEffects": [
      "./src/some-side-effectful-file.js",
      "*.css"
    ]
  }
  ```

做到以上几点，webpack的tree shaking就会生效，所以建议一直这样做，可以说百利而无一害