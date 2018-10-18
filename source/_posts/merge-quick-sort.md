---
title: 随手练练 - 归并和快速排序
date: 2018-10-17 13:27:37
categories:
- programming
tags:
- algorithm
---

# 归并排序和快速排序比较

归并和快速排序是两种常见的排序算法，基本思路都是分治，平均时间复杂度都是`O(nlg(n))`，下面是它们的一些特性比较：

|                | 归并排序  | 快速排序  |
| -------------- | --------- | --------- |
| 平均时间复杂度 | O(nlg(n)) | O(nlg(n)) |
| 最坏时间复杂度 | O(nlg(n)) | O(n^2)    |
| 稳定性         | 稳定      | 不稳定    |
| 空间复杂度     | O(n)      | O(1)      |

# 归并排序实现

[merge-sort.js](https://gist.github.com/tomwang1013/a5c7d25c776669411cc59e20963ef00e)

```javascript
/**
 * marge an array arr
 * @param {Array} arr 
 */
function mergeSort(arr) {
  mergeSortRange(arr, 0, arr.length - 1);
}

/**
 * merge sort arr[l..h]
 * @param {Array} arr 
 * @param {Number} l 
 * @param {Number} h 
 */
function mergeSortRange(arr, l, h) {
  if (l >= h) return;

  const m = l + Math.floor((h - l) / 2);
  mergeSortRange(arr, l, m);
  mergeSortRange(arr, m + 1, h);
  merge(arr, l, m, h);
}

/**
 * merge arr[p..q] and arr[q + 1..r]
 * @param {Array} arr 
 * @param {Number} p 
 * @param {Number} q 
 * @param {Number} r 
 */
function merge(arr, p, q, r) {
  const tmpArr = new Array(r - p + 1);
  let i = p;
  let j = q + 1;
  let k = 0;

  while (i <= q && j <= r) {
    if (arr[i] <= arr[j]) {
      tmpArr[k++] = arr[i++];
    } else {
      tmpArr[k++] = arr[j++];
    }
  }

  while (i <= q) {
    tmpArr[k++] = arr[i++];
  }

  while (j <= r) {
    tmpArr[k++] = arr[j++];
  }

  k = 0;
  while (k <= r - p) {
    arr[k + p] = tmpArr[k++];
  }
}
```

归并排序一个最大的缺点是它不能原地排序，需要分配一个临时的数组来存储归并结果并将归并结果写入原数组对应位置，这是它不那么流行的原因之一

# 快速排序实现

[quick sort](https://gist.github.com/tomwang1013/c9c4512f7c0359c41e97bea7f29aec09)

```javascript
/**
 * quick sort an array arr
 * @param {Array} arr 
 */
function quickSort(arr) {
  quickSortRange(arr, 0, arr.length - 1);
}

/**
 * quick sort arr[l..h]
 * @param {Array} arr 
 * @param {Number} l 
 * @param {Number} h 
 */
function quickSortRange(arr, l, h) {
  if (l >= h) return;

  const m = partition(arr, l, h);
  quickSortRange(arr, l, m - 1);
  quickSortRange(arr, m + 1, h);
}

/**
 * partition arr by the last element
 * @param {Array} arr 
 * @param {Number} l 
 * @param {Number} h 
 * @returns index of the partition element
 */
function partition(arr, l, h) {
  let i = l;
  let j = l;

  while (j < h) {
    if (arr[j] < arr[h]) {
      swapArrEle(arr, i++, j++);
    } else {
      j++;
    }
  }

  swapArrEle(arr, i, h);
  return i;
}

function swapArrEle(arr, i, j) {
  if (i === j) return;

  const tmp = arr[j];
  arr[j] = arr[i];
  arr[i] = tmp;
}
```

快速排序的关键是`partition`函数，它能实现原地分隔，不需要分配临时数组，所以它比merge sort应用广泛一点

# 分治减治思想

这2种排序都用到了分治思想，即把一个大问题拆成小问题，**每个**小问题都解决了，大问题也就解决了；还有一种思想是减治：把一个大问题化简为**一个**小问题，这个小问题解决了，大问题也就解决了，二分查找就是典型的减治思想的应用。这两种思想的时间复杂度不同，减治算法通常时间复杂度更小