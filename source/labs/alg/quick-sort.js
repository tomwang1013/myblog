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
quickSort(arr);
assertArrEqual(arr, [1, 3, 4, 5, 9, 10]);

arr = [5, 9, 20, 74, 87, 3, 5, 6, 9, 64, 23];
quickSort(arr);
assertArrEqual(arr, [3, 5, 5, 6, 9, 9, 20, 23, 64, 74, 87]);