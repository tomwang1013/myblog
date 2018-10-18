/**
 * marge sort an array arr
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

// test
function assertArrEqual(arr1, arr2) {
  console.log('arr1: ', arr1, 'arr2: ', arr2)

  if (arr1.length !== arr2.length) {
    throw new Error('arrs length not equal')
  }

  arr1.forEach((element, i) => {
    if (element !== arr2[i]) {
      throw new Error('arrs values not equal')
    }
  });
}

let arr = [3, 4, 5, 1, 9, 10];
mergeSort(arr);
assertArrEqual(arr, [1, 3, 4, 5, 9, 10]);

arr = [5, 9, 20, 74, 87, 3, 5, 6, 9, 64, 23];
mergeSort(arr);
assertArrEqual(arr, [3, 5, 5, 6, 9, 9, 20, 23, 64, 74, 87]);