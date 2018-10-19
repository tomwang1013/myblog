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

let arr = [10, 3, 4, 5, 1, 9];
console.log(topK(arr, 1));
console.log(topK(arr, 2));
console.log(topK(arr, 3));
console.log(topK(arr, 4));
console.log(topK(arr, 5));
console.log(topK(arr, 6));

arr = [5, 9, 20, 74, 87, 3, 5, 6, 9, 64, 23];
console.log(topK(arr, 2));
console.log(topK(arr, 3));
console.log(topK(arr, 4));
console.log(topK(arr, 5));
console.log(topK(arr, 6));

arr = [2, 4, 5, 3]
console.log(topK(arr, 3))