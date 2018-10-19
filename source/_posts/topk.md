---
title: 随手练练：O(n)时间复杂度解决topk
categories:
  - programming
date: 2018-10-19 09:02:28
tags:
  - algorithm
---
# 基本思路

利用快排中的`partition`算法对数组a[n]进行划分成：a[0..p-1], a[p], a[p+1..n-1], 如果p+1=k，完成；如果p+1>k, 问题转化为在a[0..p-1]中查找topk；否则，问题转化为在a[p+1..n-1]中查找top(k-p-1)。这样，我们利用减治的思路一步步对数组做原地划分，算法终止时，我们直接取数组的前k个元素即可

# 实现

[topK](https://gist.github.com/tomwang1013/6015cc8ba2c52d7e24d9e01d1b25fcaf)

```javascript
/**
 * 查找数组的top K元素
 * @param {Array} arr
 * @param {Number} k
 */
function topK(arr, k) {
  topKRange(arr, 0, arr.length - 1, k);
  return arr.slice(0, k);
}

/**
 * 在arr[l..h]中查找top k
 * @param {Array} arr 
 * @param {Number} l 
 * @param {Number} h 
 * @param {Number} k 
 */
function topKRange(arr, l, h, k) {
  if (l >= h) return;

  const m = partition(arr, l, h);

  if (m - l + 1 === k) {
    return;
  }

  if (m - l + 1 > k) {
    topKRange(arr, l, m - 1, k);
  } else {
    topKRange(arr, m + 1, h, k - (m - l + 1));
  }
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
    if (arr[j] > arr[h]) {
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