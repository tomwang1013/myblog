---
title: vue patch算法解读之一：根组件的初始化
categories:
  - programming
tags:
  - vue
  - read-source-code
typora-copy-images-to: ..\images
date: 2018-11-10 23:52:03
---


vue的渲染过程是由vnode驱动的，当数据发生变化时，根据前后vnode的差异使用patch算法只重新渲染变化的部分。这里说的渲染其实就是重新调整组件的DOM结构：复用、移动、删除dom节点使得真实dom和vdom保持一致。这个过程其实是很复杂的，这里我尝试一边读源码调试，一边记录对这个过程的理解，在完全理解之前，这里记录的都是一些片段，希望最后能将这些片段串联起来组成一篇真正的有条理的解读

# 根组件的初始化

我们以一个简单的例子开始：

```javascript
// main.js
import App from './App.vue'
new Vue({
  render: h => h(App),
}).$mount('#app')
```

```vue
// app.vue
<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <div>hello, world!</div>
  </div>
</template>

<script>
export default {
  name: 'app',
}
</script>
```

```html
// index.html
<div id="app"></div>
```

我们把最顶层组件(new Vue出来的)称为root，程序的运行以root的渲染开始。vue实例的渲染分两步：第一步是render，得到代表它的结构的vnode；第二部根据vnode，渲染出真实的dom。整个渲染过程为：

```javascript
// src/core/instance/lifecycle.js
updateComponent = () => {
  vm._update(vm._render(), hydrating)
}
```

## _render

`_render`会调用vm的`render`函数，root的render函数很简单：`h => h(App)`。这里的h其实就是实例方法`vm.$createElement`：

```javascript
// src/core/instance/render.js
// normalization is always applied for the public version, used in
// user-written render functions.
vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)
```

所以`createElement`这个函数必须返回一个vnode：

```javascript
// src/core/vdom/create-element.js
export function createElement (
  context: Component,
  tag: any,
  data: any,
  children: any,
  normalizationType: any,
  alwaysNormalize: boolean
): VNode | Array<VNode> {
  ...
  return _createElement(context, tag, data, children, normalizationType)
}
```

只是简单包装了一下，最终调用的是`_createElement`，这个函数很复杂，我们截出骨干部分：

```javascript
// src/core/vdom/create-element.js
export function _createElement (
  context: Component,
  tag?: string | Class<Component> | Function | Object,
  data?: VNodeData,
  children?: any,
  normalizationType?: number
): VNode | Array<VNode> {
  ...
  let vnode, ns
  if (typeof tag === 'string') {
    let Ctor
    ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag)
    if (config.isReservedTag(tag)) {
      // platform built-in elements
      vnode = new VNode(
        config.parsePlatformTagName(tag), data, children,
        undefined, undefined, context
      )
    } else if ((!data || !data.pre) && isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
      // component
      vnode = createComponent(Ctor, data, context, children, tag)
    } else {
      ...
    }
  } else {
    // direct component options / constructor
    vnode = createComponent(tag, data, context, children)
  }
  
  return vnode;
}
```

我们看看这个函数的参数：

- context：表示当前的vue实例，因为所有的方法最开始都是由某个vue实例调用方法引起的，就这里来说是调用`$createElement`引起的
- tag：表示这个vnode的类型，它可以是以下几种类型：
  - html内置的标签名，如"div"
  - vue组件名称，如`<cmpName></cmpName>`中的"cmpName"
  - 代表vue组件的对象，如这里的App，是从app.vue import进来的
  - 代表vue组件的构造函数，本质上和对象是一致的
- data：vnode的数据，如各种属性
- children：子元素
- normalizationType：暂时不管

就我们这个例子来说，`App`是一个对象，所以走的是下面这句代码：

```javascript
// direct component options / constructor
vnode = createComponent(tag, data, context, children)
```

由函数`createComponent`返回vnode，这个函数也比较复杂，我们看看关键部分：

```javascript
// src/core/vdom/create-component.js
export function createComponent (
  Ctor: Class<Component> | Function | Object | void,
  data: ?VNodeData,
  context: Component,
  children: ?Array<VNode>,
  tag?: string
): VNode | Array<VNode> | void {
  const baseCtor = context.$options._base

  // plain options object: turn it into a constructor
  if (isObject(Ctor)) {
    Ctor = baseCtor.extend(Ctor)
  }

  data = data || {}

  // extract props
  const propsData = extractPropsFromVNodeData(data, Ctor, tag)

  // install component management hooks onto the placeholder node
  installComponentHooks(data)

  // return a placeholder vnode
  const name = Ctor.options.name || tag
  const vnode = new VNode(
    `vue-component-${Ctor.cid}${name ? `-${name}` : ''}`,
    data, undefined, undefined, undefined, context,
    { Ctor, propsData, listeners, tag, children },
    asyncFactory
  )
	return vnode
}
```

这个函数主要就是根据App这个组件来构造一个vnode出来，它首先做了一件最关键的事：创建组件的构造函数。我们知道，所有的组件实例最终都是通过某个构造函数new出来的：`new Ctor(options)`，这个Ctor可以是Vue这个顶层内置构造函数，也可以是从Vue继承下来的组件构造函数。

这里的`baseCtor`就是`Vue`，`Ctor`就是`App`这个对象，我们通过`Vue.extend`函数将App对象转化为构造函数：`Ctor = baseCtor.extend(Ctor)`，extend函数构建原型链并返回创建的构造函数：

```javascript
  // src/core/global-api/extend.js
  Vue.extend = function (extendOptions: Object): Function {
    const Super = this
    extendOptions = extendOptions || {}
    const Sub = function VueComponent (options) {
      this._init(options)
    }
    Sub.prototype = Object.create(Super.prototype)
    Sub.prototype.constructor = Sub
    Sub.cid = cid++
    Sub.options = mergeOptions(
      Super.options,
      extendOptions
    )
    Sub['super'] = Super
    ...
    return Sub
  }
```

这里特别要注意的是构造函数的`options`属性，它是由自己的属性和父类的属性合并而成的。在通过构造函数new一个vue实例的时候，我们还会传另一个options对象进来，这个对象和构造函数本身的options一起构成vue实例最终的`$options`属性值。

我们继续回到createComponent函数，得到构造函数之后我们提取`propsData`，即传给组件的props的数据；然后调用`installComponentHooks`在data上面增加一个hook属性，属性里面包含四个函数，它们将会在patch过程中分别在不同的时机被调用到：

```javascript
data.hook = {
  init() {},
  prepatch() {},
  insert() {},
  destroy() {}
}
```

我们后面会讲到其中的init，其他的先不管。最后就是vnode的创建了：

```javascript
const vnode = new VNode(
  `vue-component-${Ctor.cid}${name ? `-${name}` : ''}`,
  data, undefined, undefined, undefined, context,
  { Ctor, propsData, listeners, tag, children },
  asyncFactory
)
```

大家可以对照下VNode的构造函数看看：

```javascript
constructor (
  tag?: string,
  data?: VNodeData,
  children?: ?Array<VNode>,
  text?: string,
  elm?: Node,
  context?: Component,
  componentOptions?: VNodeComponentOptions,
  asyncFactory?: Function
) {
  ...
}
```

可以看到，构造函数保存在`componentOptions`中，并且tag值是类似vue-component-1-app这种字符串。

看到这里大家可能有点疑问，我们知道一个vm有一个vnode和它对应，代表vm的dom结构的描述，而我们这里显然还没有得到App这个组件的实例，那这里的vnode(h(App)的返回值)和哪个vm对应的呢？答案是它不和任何vm对应，这种vnode在源码中被称为**placeholder vnode**，它们的存在是为了创建组件的实例，毕竟创建实例的构造函数被保存在这里。其实不光是构造函数，由它创建出来的vm实例也被保存了起来：`vnode.componentInstance`

## _update

`_render`返回vnode之后，`_update`将vnode转化为真正的DOM：

```javascript
	Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {
    const vm: Component = this
    const prevEl = vm.$el
    const prevVnode = vm._vnode
    const prevActiveInstance = activeInstance
    activeInstance = vm
    vm._vnode = vnode
    if (!prevVnode) {
      // initial render
      vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)
    } else {
      // updates
      vm.$el = vm.__patch__(prevVnode, vnode)
    }
    activeInstance = prevActiveInstance
    ...
  }
```

返回的vnode保存在`_vnode`中，然后看之前的_vnode是否存在，不存在的话表示第一次渲染，否则只是更新。无论如何都是调用`__path__`函数，`__path__`函数定义如下：

```javascript
// src/platforms/web/runtime/index.js
import { patch } from './patch'
Vue.prototype.__patch__ = inBrowser ? patch : noop

// src/platforms/web/runtime/patch.js
import * as nodeOps from 'web/runtime/node-ops'
import { createPatchFunction } from 'core/vdom/patch'
import baseModules from 'core/vdom/modules/index'
import platformModules from 'web/runtime/modules/index'

// the directive module should be applied last, after all
// built-in modules have been applied.
const modules = platformModules.concat(baseModules)

export const patch: Function = createPatchFunction({ nodeOps, modules })
```

可以看到最终的patch函数是src/core/vdom/patch.js中的`createPatchFunction`的返回值，整个这个文件就是来生成真正的DOM的：

```javascript
// src/core/vdom/patch.js
export function createPatchFunction (backend) {
  const { modules, nodeOps } = backend
  
  /* 定义了一大堆内部函数 */
  
  return function patch (oldVnode, vnode, hydrating, removeOnly) {
    ...
  }
}
```

我们以这个例子看看首次渲染是如何进行的，首次渲染调用如下：

```javascript
vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)
```

在渲染之前`vm.$el`的值是html中div#app元素($mount('#app'))，`vnode`当前_vnode，hydrating只有在SSR时才是true，其他情况都是false，以这些参数，我们看看patch函数是如何执行的，为简单起见，我们只保留这个例子要执行的代码路径：

```javascript
	// src/core/vdom/patch.js	
	function patch (oldVnode, vnode, hydrating, removeOnly) {
    if (isUndef(vnode)) {
      ...
    }

    let isInitialPatch = false
    const insertedVnodeQueue = []

    if (isUndef(oldVnode)) {
      ...
    } else {
      const isRealElement = isDef(oldVnode.nodeType)
      if (!isRealElement && sameVnode(oldVnode, vnode)) {
        ...
      } else {
        if (isRealElement) {
          // mounting to a real element
          oldVnode = emptyNodeAt(oldVnode)
        }

        // replacing existing element
        const oldElm = oldVnode.elm
        const parentElm = nodeOps.parentNode(oldElm)

        // create new node
        createElm(
          vnode,
          insertedVnodeQueue,
          // extremely rare edge case: do not insert if old element is in a
          // leaving transition. Only happens when combining transition +
          // keep-alive + HOCs. (#4590)
          oldElm._leaveCb ? null : parentElm,
          nodeOps.nextSibling(oldElm)
        )
       
        // destroy old node
        if (isDef(parentElm)) {
          removeVnodes(parentElm, [oldVnode], 0, 0)
        } else if (isDef(oldVnode.tag)) {
          ...
        }
      }
    }

    ...
    return vnode.elm
  }
```

因为这里的oldVnode是一个dom元素，`isRealElement`为true，所以会调用`createElm`来创建vnode对应的根元素并保存在vnode的`elm`属性中，整个patch函数返回的也是这个根元素。我们来看看createElm的实现，和之前一样，只列出关键代码：

```javascript
	function createElm (
    vnode,
    insertedVnodeQueue,
    parentElm,
    refElm,
    nested,
    ownerArray,
    index
  ) {
    if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
      return
    }

    const data = vnode.data
    const children = vnode.children
    const tag = vnode.tag
    if (isDef(tag)) {
      vnode.elm = vnode.ns
        ? nodeOps.createElementNS(vnode.ns, tag)
        : nodeOps.createElement(tag, vnode)
      setScope(vnode)

      /* istanbul ignore if */
      if (__WEEX__) {
        ...
      } else {
        createChildren(vnode, children, insertedVnodeQueue)
        if (isDef(data)) {
          invokeCreateHooks(vnode, insertedVnodeQueue)
        }
        insert(parentElm, vnode.elm, refElm)
      }
    } else if (isTrue(vnode.isComment)) {
      vnode.elm = nodeOps.createComment(vnode.text)
      insert(parentElm, vnode.elm, refElm)
    } else {
      vnode.elm = nodeOps.createTextNode(vnode.text)
      insert(parentElm, vnode.elm, refElm)
    }
  }
```

这个函数接受七个参数，我们先只关注第一、三、四个，vnode不用说；parentElm和refElm表示将要创建的根节点的父元素和后面的兄弟元素，我们需要将根节点插入到指定位置。函数开头先用前四个参数调用`createComponent`，并且如果返回值为true的话直接结束，后面那一大段代码都不用执行了，就我们的例子来说，返回值确实是true。实际上在`vm.$createElement`中所有由`createComponent`(不是这里的createComponent)创建的vnode调用这里的createComponent都会返回true：

```javascript
// src/core/vdom/create-element.js
export function _createElement (
  ...
): VNode | Array<VNode> {
  if (typeof tag === 'string') {
    if (config.isReservedTag(tag)) {
      ...
    } else if (...) {
      // component
      vnode = createComponent(Ctor, data, context, children, tag)
    } else {
      ...
    }
  } else {
    // direct component options / constructor
    vnode = createComponent(tag, data, context, children)
  }
  
  return vnode
}
```

我们来看看patch中的createComponent：

```javascript
// src/core/vdom/patch.js
function createComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
  let i = vnode.data
  if (isDef(i)) {
    if (isDef(i = i.hook) && isDef(i = i.init)) {
      i(vnode, false /* hydrating */)
    }
    // after calling the init hook, if the vnode is a child component
    // it should've created a child instance and mounted it. the child
    // component also has set the placeholder vnode's elm.
    // in that case we can just return the element and be done.
    if (isDef(vnode.componentInstance)) {
      initComponent(vnode, insertedVnodeQueue)
      insert(parentElm, vnode.elm, refElm)
      return true
    }
  }
}
```

这里判断vnode中的data属性是否存在，然后在判断data中的hook及hook中的init函数是否存在，根据我们之前的分析，这些都是存在的，所以会调用`vnode.data.hook.init`函数，这个函数定义如下：

```javascript
// src/core/vdom/create-component.js
init (vnode: VNodeWithData, hydrating: boolean): ?boolean {
  if (
    vnode.componentInstance &&
    !vnode.componentInstance._isDestroyed &&
    vnode.data.keepAlive
  ) {
    ...
  } else {
    const child = vnode.componentInstance = createComponentInstanceForVnode(
      vnode,
      activeInstance
    )
    child.$mount(hydrating ? vnode.elm : undefined, hydrating)
  }
},
```

if不满足，进入else，这里就是App这个组件实例化的地方。我们知道，这里的vnode保存了App的构造函数，我们通过`createComponentInstanceForVnode`创建一个App实例，并将它保存在componentInstance属性中：

```javascript
// src/core/vdom/create-component.js
export function createComponentInstanceForVnode (
  vnode: any, // we know it's MountedComponentVNode but flow doesn't
  parent: any, // activeInstance in lifecycle state
): Component {
  const options: InternalComponentOptions = {
    _isComponent: true,
    _parentVnode: vnode,
    parent
  }
  return new vnode.componentOptions.Ctor(options)
}
```

App的构造函数我们之前讲过了，这里我们给构造函数再传了一个options，注意options中包含的值，这些值最终都会被合并到被创建的vm实例的`$options`属性中。

创建完App的实例后再调用$mount将这个实例渲染出来，**这又会重新走一次`_render`和`_update`的过程**，只不过当前实例变成了刚创建的App组件实例，而不是我们现在正在分析的根组件实例。这个重新的过程我们暂时按下不表，我们先假设它们已经走完了，这样我们从hook.init返回了重新来到了这里：

```javascript
// src/core/vdom/patch.js
function createComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
  let i = vnode.data
  if (isDef(i)) {
    if (isDef(i = i.hook) && isDef(i = i.init)) {
      i(vnode, false /* hydrating */)
    }
    
    // 返回了，vnode.componentInstance已经保存了App实例
    
    // after calling the init hook, if the vnode is a child component
    // it should've created a child instance and mounted it. the child
    // component also has set the placeholder vnode's elm.
    // in that case we can just return the element and be done.
    if (isDef(vnode.componentInstance)) {
      initComponent(vnode, insertedVnodeQueue)
      insert(parentElm, vnode.elm, refElm)
      return true
    }
  }
}
```

再往下的if为真，我们先执行`initComponent`：

```javascript
// src/core/vdom/patch.js
function initComponent (vnode, insertedVnodeQueue) {
  ...
  vnode.elm = vnode.componentInstance.$el
  ...
}

```

关键的代码就上面一句，App实例(vnode.componentInstance)mount之后，实例中的`$el`就是它的根元素，我们把它赋给`vnode.elm`。

接下来就是insert操作，这才是真正的dom操作，把这个渲染好的根元素插入到指定位置：`insert(parentElm, vnode.elm, refElm)`：

```javascript
// src/core/vdom/patch.js
function insert (parent, elm, ref) {
  if (isDef(parent)) {
    if (isDef(ref)) {
      if (nodeOps.parentNode(ref) === parent) {
        nodeOps.insertBefore(parent, elm, ref)
      }
    } else {
      nodeOps.appendChild(parent, elm)
    }
  }
}
```

至此，根组件就展示在页面上面了：

![](../images/1541864549578.png)

由于createComponent返回true，createElm直接返回，这样patch继续：

```javascript
	// src/core/vdom/patch.js	
	function patch (oldVnode, vnode, hydrating, removeOnly) {
    if (isUndef(oldVnode)) {
      ...
    } else {
      if (!isRealElement && sameVnode(oldVnode, vnode)) {
        ...
      } else {
        // create new node
        createElm(
          vnode,
          insertedVnodeQueue,
          // extremely rare edge case: do not insert if old element is in a
          // leaving transition. Only happens when combining transition +
          // keep-alive + HOCs. (#4590)
          oldElm._leaveCb ? null : parentElm,
          nodeOps.nextSibling(oldElm)
        )
        
        // 继续
       
        // destroy old node
        if (isDef(parentElm)) {
          removeVnodes(parentElm, [oldVnode], 0, 0)
        } else if (isDef(oldVnode.tag)) {
          ...
        }
      }
    }

    return vnode.elm
  }
```

我们新创建了一个根元素(vnode.elm)，所以需要把以前的删掉：`removeVnodes(parentElm, [oldVnode], 0, 0)`。然后就返回新的根元素，重新回到`_update`：

```javascript
vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)
```

至此，故事告一段落，下次继续讲解App实例是怎么mount的。