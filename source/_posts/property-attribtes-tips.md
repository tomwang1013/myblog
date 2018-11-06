---
title: property descriptor的几个疑难点
categories:
  - programming
tags:
  - javascript
  - es5
date: 2018-10-29 10:18:05
---


`property descriptor`是javascript对象中属性的描述对象，包括了这个属性的meta信息，基本知识大家都知道，这里总结一些很隐晦的容易忽略的注意点

# writable vs configurable

1. `writable`控制`value`能否更改：
   - 如果writable = true, value可以(通过赋值直接)修改，和configurable无关
   - 如果writable = false, value不可以(通过赋值直接)修改，但是如果此时configurable为true，则仍然可以通过`defineProperty`修改value的值
2. `configurable`控制能否修改descriptor的所有属性**以及**能否删除属性(delete o.foo)
   - 如果configurable为true，没啥说的，descriptor中什么都能改
   - 如果configurable为false，按理说，descriptor中什么都不能改，但是有一个例外：**writable**能从true改成false

# defineProperty vs assignment

`defineProperty`和直接赋值(assignment)都能定义或修改属性，但是它们还是有很多不同点的：

1. descriptor中的默认值不一样

   ```javascript
   let o = {}
   
   Object.defineProperty(o, 'foo', {
     value: 1
   })
   // { value: 1, writable: false, enumerable: false, configurable: false}
   Object.getOwnPropertyDescriptor(o, 'foo')
   
   o.bar = 1
   // { value: 1, writable: true, enumerable: true, configurable: true}
   Object.getOwnPropertyDescriptor(o, 'bar')
   ```

2. 是否需要考虑原型链的情况不一样

   - defineProperty和原型链完全无关：它只会定义一个新的属性或修改现有的own property

   - assignment情况有点复杂：

     - 如果这个属性存在setter(own or inherited)，直接调用setter
     - 如果这个属性是只读的(own or inherited)，抛出异常或静静地失败
     - 如果这个属性是own(可写)的，修改这个属性的值
     - 如果这个属性不存在(own or inherited)，定义一个新的own属性
     - 如果这个属性是inherited且是writable，也是一个新的own属性(覆盖掉inherited的属性)

     应该包含了所有情况吧！

# 保护对象：preventExtensions vs seal vs freeze

为了防止对象被修改，javascript也提供了三种方法，它们的不同点在于对对象的保护程度，按保护程度从小到大依次为：`preventExtensions` < `seal` < `freeze`，freeze的保护程度是最强的。我们在使用的时候按照自己的需求选择合适的方法，下面依次介绍一下：

- preventExtensions

  防止往对象上添加新的属性(defineProperty or assignment)

- seal

  除了preventExtensions之外，还把所有属性置为"unconfigurable"

  ```javascript
  let o = { foo: 1 }
  
  // before sealing: {value: 1, writable: true, enumerable: true, configurable: true}
  Object.getOwnPropertyDescriptor(o, 'foo')
  
  Object.seal(o)
  // after sealing: {value: 1, writable: true, enumerable: true, configurable: false}
  Object.getOwnPropertyDescriptor(o, 'foo')
  
  // 依然可以修改属性的值
  o.foo = 2
  ```

- freeze

  除了seal之外，还把所有属性置为"unwritable"，就是说属性的值也不能修改了，这是最彻底的：不能增/删/改，也不能修改descriptor

注意：上面所有的保护措施只针对对象本身，和它的原型链无关

