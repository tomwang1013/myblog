---
title: async generator - awesome & utimate solution for async programming
categories:
  - programming
date: 2023-08-08 12:41:22
tags:
  - javascript
  - es6
---

`iterable` & `iterator` are ancient concepts in programming languages. Something is *iterable* because it has a *iterator* which we can use to iterate it. Their relation and interfaces are as follows:

![relation](https://exploringjs.com/impatient-js/img-book/sync-iteration/iteration-protocol.svg)

```typescript
interface Iterable<T> {
  [Symbol.iterator]() : Iterator<T>;
}

interface Iterator<T> {
  next() : IteratorResult<T>;
}

interface IteratorResult<T> {
  value: T;
  done: boolean;
}
```

A `generator` is just both an iterable & iterator. You can use it wherever an iterable can be used, e.g. `for...of`.

```javascript
function* genFun() {
  yield 1;
  yield 2;
}

const gor = genFun();

// gor is iterable, we get its itertor
const itor = gor[Symbol.iterator]();

// gor is also a itertor, we can call its next method directly
console.log(gor.next());

console.log(itor.next());

for (let i of gor) {
  console.log(i); // 1 2
}
```

We say they(iteration & generator) are **sync** because we get the data immediately by calling `next()`. What if `next()` returns a `promise`:

```typescript
interface AsyncIterable<T> {
  [Symbol.asyncIterator]() : AsyncIterator<T>;
}
interface AsyncIterator<T> {
  next() : Promise<IteratorResult<T>>; // (A)
}
interface IteratorResult<T> {
  value: T;
  done: boolean;
}
```

We call is **async iteration**. `async iterable` can be used in `for...wait...of`:

```javascript
const arr = [Promise.resolve('a'), Promise.resolve('b')];
for await (const x of arr) {
  console.log(x);
}
// Output:
// 'a'
// 'b'
```

Now we can talk about `async generator`. As contrasted with `sync generator`, `async generator` is just both a `async iterable & iterator`. For example:

```javascript
async function* yield123() {
  for (let i=1; i<=3; i++) {
    yield i;
  }
}

const asyncIterable = yield123();

// or just *const asyncIterator = asyncIterable;*
const asyncIterator = asyncIterable[Symbol.asyncIterator]();

console.log(await asyncIterator.next()); // { value: 1, done: false }
console.log(await asyncIterator.next()); // { value: 2, done: false }
console.log(await asyncIterator.next()); // { value: 3, done: false }
console.log(await asyncIterator.next()); // { value: undefined, done: false }

for await (const x of yield123()) {
  console.log(x); // 1 2 3
}
```

**`sync generator` yield a normal value while `async generator` yield a promise. That's the only difference**(off course, we should add `async` key word before the generator function).

Another example: transforming an async iterable

```javascript
async function* timesTwo(asyncNumbers) {
  for await (const x of asyncNumbers) {
    yield x * 2;
  }
}
```

Last real example from [async-pool](https://github.com/rxaviers/async-pool): throttle a bunch of requests with a max count of parallel ongoing requests:

```javascript
async function* asyncPool(concurrency, iterable, iteratorFn) {
    const executing = new Set();
    async function consume() {
        const [promise, value] = await Promise.race(executing);
        executing.delete(promise);
        return value;
    }
    for (const item of iterable) {
        // Wrap iteratorFn() in an async fn to ensure we get a promise.
        // Then expose such promise, so it's possible to later reference and
        // remove it from the executing pool.
        const promise = (async () => await iteratorFn(item, iterable))().then(
            value => [promise, value]
        );
        executing.add(promise);
        if (executing.size >= concurrency) {
            yield await consume();
        }
    }
    while (executing.size) {
        yield await consume();
    }
}
```

Usage of it:

```javascript
const timeout = i =>
  new Promise(resolve =>
    setTimeout(() => {
      resolve(i);
    }, i)
  );

const gen = asyncPool(2, [10, 50, 30, 20], timeout);

async function check() {
  for await (const t of gen) {
    console.log(t);
  }
}

check();
```
