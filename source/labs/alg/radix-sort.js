/**
* 基数排序示例实现:
* 以0~999以内的数字排序说明基数排序的思路，根据要排序的数据的不同性质
* 算法的实现细节可能不一样：具体不同在"基"和"桶"的选择
*/

function radixSort(arr) {  
  let radix = 3;
  while (radix--) {
    const tmp = new Array(10);
    arr.forEach(element => {
      const rv = getRadixes(element)[radix];
      tmp[rv] ? tmp[rv].push(element) : tmp[rv] = [element];
    });
    
    let i = 0;
    tmp.forEach(element => {
      if (element) {
        element.forEach(a => arr[i++] = a)
      }
    })
  }
}

/**
* 返回数字对应的所有的'基'
* @param {Number} num 数字
*/
function getRadixes(num) {
  return [Math.floor(num / 100), Math.floor(num / 10) % 10, num % 10];
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

let arr = [3, 4, 5, 43, 65, 1, 100, 9, 10];
radixSort(arr);
assertArrEqual(arr, [1, 3, 4, 5, 9, 10, 43, 65, 100]);

arr = [5, 9, 20, 74, 87, 3, 231, 5, 6, 9, 64, 23];
radixSort(arr);
assertArrEqual(arr, [3, 5, 5, 6, 9, 9, 20, 23, 64, 74, 87, 231]);
